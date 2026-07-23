# Deployment

## Node

From `backend`:

```powershell
npm ci --omit=dev
$env:NODE_ENV="production"
$env:DB_PATH="C:\data\biasmap.sqlite"
npm start
```

Use a durable, backed-up location for `DB_PATH`. The service listens on `PORT` (default `3000`). Set `CORS_ORIGIN` to the frontend origin instead of `*` when possible. Run behind TLS and an identity-aware reverse proxy because this API intentionally has no authentication.

## Docker Compose

From the repository root:

```powershell
docker compose up --build
```

The `backend` service exposes port 3000 and stores SQLite in the named `biasmap-data` volume. Compose enables the sample seed data; set `SEED_DATABASE=false` in a production override after the first initialization. The Docker image copies the schema and application source and runs as a production Node process.

## Operations

Use `GET /health` for liveness checks. Send `SIGTERM` for graceful shutdown; the server stops accepting requests and closes the SQLite connection. No secrets are required by the backend currently.
