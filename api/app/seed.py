import asyncio
import io
import json
import os
import re
import time
import urllib.error
import urllib.request
import uuid
from http.cookiejar import CookieJar

from redis import Redis

from app.main import BOOK_BUCKET, book_cache_key, database, ensure_bucket, object_store

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "password123"
AUTH_URL = os.environ.get("AUTH_URL", "http://auth:3001")
MAILPIT_URL = os.environ.get("MAILPIT_URL", "http://mailpit:8025")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


def request_json(opener, url: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"} if data else {},
        method="POST" if data else "GET",
    )
    with opener.open(request) as response:
        return json.loads(response.read())


def verification_url() -> str:
    for _ in range(10):
        messages = request_json(urllib.request.build_opener(), f"{MAILPIT_URL}/api/v1/messages")
        message = next(
            (
                item
                for item in messages["messages"]
                if any(address["Address"] == DEMO_EMAIL for address in item["To"])
                and item["Subject"] == "Verify your Library email"
            ),
            None,
        )
        if message:
            detail = request_json(urllib.request.build_opener(), f"{MAILPIT_URL}/api/v1/message/{message['ID']}")
            match = re.search(r"https?://\S+", detail["Text"])
            if match:
                return match.group(0).replace("http://localhost:3001", AUTH_URL)
        time.sleep(1)
    raise RuntimeError("Mailpit did not receive the demo verification email")


def ensure_demo_user() -> str:
    cookies = CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))
    try:
        request_json(
            opener,
            f"{AUTH_URL}/api/auth/sign-up/email",
            {
                "name": "Demo Reader",
                "email": DEMO_EMAIL,
                "password": DEMO_PASSWORD,
                "callbackURL": "http://localhost:3000/verify",
            },
        )
    except urllib.error.HTTPError:
        pass

    try:
        request_json(
            opener,
            f"{AUTH_URL}/api/auth/sign-in/email",
            {"email": DEMO_EMAIL, "password": DEMO_PASSWORD},
        )
    except urllib.error.HTTPError as error:
        if error.code != 403:
            raise
        verification = verification_url()
        try:
            urllib.request.build_opener(NoRedirect()).open(verification)
        except urllib.error.HTTPError as redirect:
            if redirect.code not in (302, 303):
                raise
        request_json(
            opener,
            f"{AUTH_URL}/api/auth/sign-in/email",
            {"email": DEMO_EMAIL, "password": DEMO_PASSWORD},
        )

    session = request_json(opener, f"{AUTH_URL}/api/auth/get-session")
    return session["user"]["id"]


def sample_pdf(title: str) -> bytes:
    text = f"BT /F1 24 Tf 72 720 Td ({title}) Tj ET"
    objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
        "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        f"5 0 obj\n<< /Length {len(text)} >>\nstream\n{text}\nendstream\nendobj\n",
    ]
    document = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    offsets = []
    for obj in objects:
        offsets.append(len(document))
        document += obj.encode()
    xref = len(document)
    document += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
    document += b"".join(f"{offset:010} 00000 n \n".encode() for offset in offsets)
    return document + f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()


def seed_books(user_id: str) -> None:
    ensure_bucket()
    with database() as connection:
        previous = connection.execute(
            "SELECT object_key FROM library.books WHERE user_id = %s", (user_id,)
        ).fetchall()
        connection.execute("DELETE FROM library.books WHERE user_id = %s", (user_id,))
    for book in previous:
        object_store().remove_object(BOOK_BUCKET, book["object_key"])

    books = [
        ("The Library Sample", "Public Domain", "A generated PDF for local testing.", "reading"),
        ("A Quiet Shelf", "Demo Author", "A second sample for the library list.", "unread"),
        ("Finished Pages", "Demo Author", "A completed reading example.", "finished"),
    ]
    with database() as connection:
        for title, author, description, reading_status in books:
            book_id = str(uuid.uuid4())
            object_key = f"books/{user_id}/{book_id}.pdf"
            pdf = sample_pdf(title)
            object_store().put_object(
                BOOK_BUCKET,
                object_key,
                io.BytesIO(pdf),
                len(pdf),
                content_type="application/pdf",
            )
            connection.execute(
                """
                INSERT INTO library.books (id, user_id, title, author, description, reading_status, object_key)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (book_id, user_id, title, author, description, reading_status, object_key),
            )
    Redis.from_url(os.environ["REDIS_URL"]).delete(book_cache_key(user_id))


def main() -> None:
    user_id = ensure_demo_user()
    seed_books(user_id)
    print(f"Seeded {DEMO_EMAIL} with three sample books.")


if __name__ == "__main__":
    main()
