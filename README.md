# AI Interview Coach

A monorepo for an AI-powered interview preparation platform built with Nx, Angular 20, NestJS, Prisma, and PostgreSQL.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, Tailwind CSS, Angular Material |
| Backend | NestJS 10, Passport JWT, class-validator |
| Database | PostgreSQL 16 (Prisma ORM) |
| Cache | Redis 7 |
| Workspace | Nx 23, TypeScript 5.8 |
| Testing | Jest 29, Playwright |

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20 LTS |
| npm | 10 |
| Docker Desktop | 25 |

---

## Local Development Setup

### 1 — Clone and install

```bash
git clone <repository-url>
cd ai-interview-coach
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET and (optionally) OPENAI_API_KEY
```

### 3 — Start Docker services

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

### 4 — Run database migrations

```bash
npx prisma generate --schema apps/api/prisma/schema.prisma
npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name init
```

### 5 — Start the backend

```bash
npx nx serve api
# API running at  http://localhost:3000/api
# Swagger docs at http://localhost:3000/api
```

### 6 — Start the frontend (new terminal)

```bash
npx nx serve web
# App running at  http://localhost:4200
```

---

## Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| Swagger / OpenAPI | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

---

## Authentication endpoints

| Method | Path | Auth required |
|---|---|---|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| POST | /api/auth/refresh | No |
| POST | /api/auth/logout | Bearer token |
| GET | /api/users/profile | Bearer token |
| PATCH | /api/users/profile | Bearer token |
| GET | /api/health | No |

---

## Development commands

```bash
# Run all tests
npx nx run-many -t test

# Run all linters
npx nx run-many -t lint

# Production build (both apps)
npx nx run-many -t build

# API tests only
npx nx test api --watch=false

# Frontend tests only
npx nx test web --watch=false
```

---

## Testing

### Unit tests

```bash
# All 258 tests (API + Web)
npx jest --no-coverage

# API only (62 tests)
npx jest apps/api --no-coverage

# Web only (196 tests)
npx jest apps/web --no-coverage
```

### Lint

```bash
# Backend – should report 0 errors
npx eslint "apps/api/src/**/*.ts"

# Frontend – should report 0 errors
npx eslint "apps/web/src/**/*.ts"
```

### TypeScript type-check

```bash
# Backend
npx tsc --project apps/api/tsconfig.app.json --noEmit

# Frontend
npx tsc --project apps/web/tsconfig.app.json --noEmit
```

### E2E tests (requires running servers)

```bash
# Start servers first (two terminals)
npx nx serve api
npx nx serve web

# Then in a third terminal
npx nx e2e web-e2e
```

E2E scenarios cover: registration, login, auth guards, dashboard, interview setup, analytics, and error validation. See `apps/web-e2e/src/interview-journey.spec.ts`.

### Database validation

```bash
cd apps/api
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma validate
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma generate
DATABASE_URL="postgresql://user:pass@localhost:5432/db" npx prisma migrate status
```

---

## Quick-start script (requires Docker)

```bash
bash scripts/setup.sh
```

This script copies `.env.example`, starts PostgreSQL, waits for it to be ready, and runs Prisma migrations.
