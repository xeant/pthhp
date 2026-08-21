# Plextype Docker Setup

## Start

```bash
docker compose up --build -d
```

Open http://localhost:3000.

Default local admin account from `.env.docker`:

- ID: `admin`
- Password: `change-this-admin-password`

Change `ADMIN_PASSWORD`, `JWT_SECRET`, `SECRET_KEY`, and database passwords before using this outside local development.

## Logs

```bash
docker compose logs -f app
```

## Stop

```bash
docker compose down
```

To remove local database, Redis, and uploaded file volumes:

```bash
docker compose down -v
```

## Services

- App: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
