# BiasMap

BiasMap is a map-oriented API for documenting and exploring reports of bias. The repository includes an Express/SQLite backend and a frontend scaffold.

## Quick start

```powershell
cd backend
copy .env.example .env
npm install
npm test
$env:SEED_DATABASE="true"
npm start
```

The API is available at `http://localhost:3000`. Health checks are exposed at `/health` and `/api/health`. Authentication is intentionally not implemented in this project; deploy the API behind an appropriate identity-aware gateway before exposing it publicly.

See [API](docs/API.md), [Database](docs/Database.md), [Architecture](docs/Architecture.md), and [Deployment](docs/Deployment.md) for details.
