#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  db_host="$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.hostname)")"
  db_port="$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.port || 5432)")"

  echo "Waiting for PostgreSQL at ${db_host}:${db_port}..."
  until nc -z "$db_host" "$db_port"; do
    sleep 1
  done

  npm run prisma:sync
  npx prisma migrate deploy

  if [ "${RUN_DB_SEED:-true}" = "true" ]; then
    node src/core/prisma/seed.js
  fi
fi

exec "$@"
