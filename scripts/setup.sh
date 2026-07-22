#!/usr/bin/env bash
set -euo pipefail

echo "==> Copying environment file..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "    .env created from .env.example — update DATABASE_URL and JWT_SECRET before continuing."
fi

echo "==> Starting PostgreSQL via Docker Compose..."
docker compose -f docker/docker-compose.yml up -d postgres

echo "==> Waiting for PostgreSQL to be ready..."
until docker compose -f docker/docker-compose.yml exec -T postgres pg_isready -U postgres -d ai_interview_coach 2>/dev/null; do
  sleep 1
done

echo "==> Running Prisma migrations..."
npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name init

echo "==> Generating Prisma client..."
npx prisma generate --schema apps/api/prisma/schema.prisma

echo ""
echo "Setup complete. Run 'npx nx serve api' to start the backend."
