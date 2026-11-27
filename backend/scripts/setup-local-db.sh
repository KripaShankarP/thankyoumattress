#!/usr/bin/env bash
# Creates the database on this computer's PostgreSQL and points backend/.env at it.
# You don't need the postgres password: sudo asks for YOUR computer login password instead.
#
#   cd backend && bash scripts/setup-local-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DB_NAME=${DB_NAME:-thankyoumattress}
DB_USER=${DB_USER:-thankyou}
DB_PASS=${DB_PASS:-$(openssl rand -hex 16)}

echo "Creating PostgreSQL user '$DB_USER' and database '$DB_NAME' (sudo may ask for your password)…"
sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE "$DB_USER" LOGIN PASSWORD '$DB_PASS' CREATEDB;
  ELSE
    ALTER ROLE "$DB_USER" WITH LOGIN PASSWORD '$DB_PASS' CREATEDB;
  END IF;
END
\$\$;
SQL
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
[ -f .env ] || cp .env.example .env
if grep -q '^DATABASE_URL=' .env; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$URL\"|" .env
else
  echo "DATABASE_URL=\"$URL\"" >> .env
fi
echo "backend/.env now uses $DB_NAME on localhost:5432."

echo "Creating the tables and adding the products…"
npx prisma migrate deploy
npm run db:seed
echo
echo "Done. Admin sign-in: the ADMIN_EMAIL / ADMIN_PASSWORD lines in backend/.env"
