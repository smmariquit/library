import io
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from enum import StrEnum
from typing import Annotated, AsyncIterator

import jwt
import psycopg
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from jwt import PyJWKClient
from minio import Minio
from pydantic import BaseModel
from psycopg.rows import dict_row
from redis import asyncio as redis

BOOK_BUCKET = "books"
MAX_PDF_BYTES = 25 * 1024 * 1024
CACHE_TTL_SECONDS = 60


class ReadingStatus(StrEnum):
    unread = "unread"
    reading = "reading"
    finished = "finished"


class Book(BaseModel):
    id: str
    title: str
    author: str
    description: str | None
    reading_status: ReadingStatus
    created_at: datetime
    updated_at: datetime


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    description: str | None = None
    reading_status: ReadingStatus | None = None


def database_url() -> str:
    return os.environ["DATABASE_URL"]


def database():
    return psycopg.connect(database_url(), row_factory=dict_row)


def object_store() -> Minio:
    return Minio(
        os.environ["MINIO_ENDPOINT"],
        access_key=os.environ["MINIO_ACCESS_KEY"],
        secret_key=os.environ["MINIO_SECRET_KEY"],
        secure=False,
    )


jwks = PyJWKClient(os.environ["JWT_JWKS_URL"])
cache = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)


def initialize_database() -> None:
    with database() as connection:
        connection.execute("CREATE SCHEMA IF NOT EXISTS library")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS library.books (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                reading_status TEXT NOT NULL CHECK (reading_status IN ('unread', 'reading', 'finished')),
                object_key TEXT NOT NULL UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS books_user_id_created_at_idx ON library.books (user_id, created_at DESC)"
        )


def ensure_bucket() -> None:
    client = object_store()
    for _ in range(20):
        try:
            if not client.bucket_exists(BOOK_BUCKET):
                client.make_bucket(BOOK_BUCKET)
            return
        except Exception:
            time.sleep(1)
    raise RuntimeError("MinIO did not become ready")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    initialize_database()
    ensure_bucket()
    yield
    await cache.aclose()


app = FastAPI(title="Personal Library API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("WEB_URL", "http://localhost:3000")],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


def current_user(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ")
    try:
        signing_key = jwks.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA"],
            issuer=os.environ["JWT_ISSUER"],
            audience=os.environ["JWT_AUDIENCE"],
        )
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token") from error

    user_id = claims.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token has no subject")
    return user_id


def book_cache_key(user_id: str) -> str:
    return f"library:books:{user_id}"


async def invalidate_books(user_id: str) -> None:
    await cache.delete(book_cache_key(user_id))


def row_to_book(row: dict) -> Book:
    return Book.model_validate(row)


def get_owned_book(book_id: str, user_id: str) -> dict:
    with database() as connection:
        row = connection.execute(
            "SELECT * FROM library.books WHERE id = %s AND user_id = %s",
            (book_id, user_id),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return row


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/books", response_model=list[Book])
async def list_books(user_id: Annotated[str, Depends(current_user)]) -> list[Book]:
    cached = await cache.get(book_cache_key(user_id))
    if cached:
        return [Book.model_validate(book) for book in json.loads(cached)]

    with database() as connection:
        rows = connection.execute(
            "SELECT id, title, author, description, reading_status, created_at, updated_at "
            "FROM library.books WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    books = [row_to_book(row) for row in rows]
    await cache.set(
        book_cache_key(user_id),
        json.dumps([book.model_dump(mode="json") for book in books]),
        ex=CACHE_TTL_SECONDS,
    )
    return books


@app.post("/books", response_model=Book, status_code=status.HTTP_201_CREATED)
async def create_book(
    user_id: Annotated[str, Depends(current_user)],
    title: Annotated[str, Form()],
    author: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    description: Annotated[str | None, Form()] = None,
    reading_status: Annotated[ReadingStatus, Form()] = ReadingStatus.unread,
) -> Book:
    content = await file.read()
    if len(content) > MAX_PDF_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="PDF exceeds 25 MB")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are accepted")

    book_id = str(uuid.uuid4())
    object_key = f"books/{user_id}/{book_id}.pdf"
    object_store().put_object(
        BOOK_BUCKET,
        object_key,
        io.BytesIO(content),
        len(content),
        content_type="application/pdf",
    )
    try:
        with database() as connection:
            connection.execute(
                """
                INSERT INTO library.books (id, user_id, title, author, description, reading_status, object_key)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (book_id, user_id, title.strip(), author.strip(), description, reading_status, object_key),
            )
    except Exception:
        object_store().remove_object(BOOK_BUCKET, object_key)
        raise

    await invalidate_books(user_id)
    return row_to_book(get_owned_book(book_id, user_id))


@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: str, user_id: Annotated[str, Depends(current_user)]) -> Book:
    return row_to_book(get_owned_book(book_id, user_id))


@app.patch("/books/{book_id}", response_model=Book)
async def update_book(
    book_id: str,
    update: BookUpdate,
    user_id: Annotated[str, Depends(current_user)],
) -> Book:
    changes = update.model_dump(exclude_none=True)
    if not changes:
        return row_to_book(get_owned_book(book_id, user_id))

    fields = ", ".join(f"{field} = %s" for field in changes)
    values = [str(value) for value in changes.values()]
    with database() as connection:
        row = connection.execute(
            f"UPDATE library.books SET {fields}, updated_at = NOW() "
            "WHERE id = %s AND user_id = %s RETURNING *",
            (*values, book_id, user_id),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    await invalidate_books(user_id)
    return row_to_book(row)


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: str, user_id: Annotated[str, Depends(current_user)]) -> None:
    book = get_owned_book(book_id, user_id)
    object_store().remove_object(BOOK_BUCKET, book["object_key"])
    with database() as connection:
        connection.execute(
            "DELETE FROM library.books WHERE id = %s AND user_id = %s",
            (book_id, user_id),
        )
    await invalidate_books(user_id)


@app.get("/books/{book_id}/read-url")
def read_url(book_id: str, user_id: Annotated[str, Depends(current_user)]) -> dict[str, str]:
    get_owned_book(book_id, user_id)
    return {"mode": "stream", "url": f"/books/{book_id}/content"}


@app.get("/books/{book_id}/content")
def read_book(book_id: str, user_id: Annotated[str, Depends(current_user)]) -> StreamingResponse:
    book = get_owned_book(book_id, user_id)
    response = object_store().get_object(BOOK_BUCKET, book["object_key"])

    def stream():
        try:
            yield from response.stream(32 * 1024)
        finally:
            response.close()
            response.release_conn()

    return StreamingResponse(stream(), media_type="application/pdf")
