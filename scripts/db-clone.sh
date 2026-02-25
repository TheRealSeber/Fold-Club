#!/usr/bin/env bash
set -euo pipefail

# Clone catalog data from Supabase into local Docker PostgreSQL.
# Usage: bash scripts/db-clone.sh
#
# Requires: .env with DATABASE_URL, Docker container "db" running.

TABLES=("products" "product_images" "product_translations")
LOCAL_DB="postgresql://root:mysecretpassword@localhost:5432/local"

# --- Load Supabase URL from .env ---
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example and fill in DATABASE_URL."
  exit 1
fi

SUPABASE_URL=$(grep -E '^DATABASE_URL=' .env | sed 's/^DATABASE_URL=//' | tr -d '"')
if [ -z "$SUPABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi

# --- Check Docker container ---
if ! docker compose ps --status running | grep -q db; then
  echo "ERROR: Docker 'db' container is not running. Run: docker compose up -d"
  exit 1
fi

# --- Push schema to local DB ---
echo "Pushing schema to local DB..."
DATABASE_URL="$LOCAL_DB" bunx drizzle-kit push --force

# --- Build pg_dump table flags ---
TABLE_FLAGS=""
for t in "${TABLES[@]}"; do
  TABLE_FLAGS="$TABLE_FLAGS --table=$t"
done

# --- Truncate local tables (reverse order for FK constraints) ---
echo "Truncating local catalog tables..."
for (( i=${#TABLES[@]}-1; i>=0; i-- )); do
  psql "$LOCAL_DB" -c "TRUNCATE ${TABLES[$i]} CASCADE;" 2>/dev/null || true
done

# --- Dump from Supabase & load into local ---
echo "Cloning catalog data from Supabase..."
pg_dump "$SUPABASE_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  $TABLE_FLAGS \
  | psql "$LOCAL_DB" --quiet

echo "Done! Cloned ${#TABLES[@]} tables into local DB."
