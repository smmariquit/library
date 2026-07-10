# Personal Library

Local full-stack personal library application. The repository starts the
Next.js frontend, FastAPI library API, Hono/Better Auth service, PostgreSQL,
Redis, MinIO, and Mailpit with Docker Compose.

## Start

```sh
cp .env.example .env
docker compose up --build
```

Service URLs:

- Frontend: http://localhost:3000
- FastAPI docs: http://localhost:8000/docs
- Auth: http://localhost:3001
- Mailpit: http://localhost:8025
- MinIO console: http://localhost:9001

The remaining README sections will document the authentication, storage,
seeding, and Redis flows as they are implemented.
