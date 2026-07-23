# Database

The backend uses SQLite through `better-sqlite3`, so local development needs no database server. On startup it runs `database/schema.sql` and enables foreign keys and WAL mode. The default file is `backend/data/biasmap.sqlite`; set `DB_PATH` to change it or use `:memory:` in tests. `SEED_DATABASE=true` runs the idempotent development seed.

## Tables

- `categories`: user-facing classification, description, and map color.
- `sources`: evidence provenance and optional URL/publisher.
- `reports`: detailed submissions, location, severity, status, evidence, and timestamps.
- `markers`: map points, optionally linked to a report.

Reports and markers index category, status, and coordinates. Category/source deletion uses `ON DELETE SET NULL`; deleting a report removes linked markers. Coordinates and severity are constrained by the schema, while request validation provides friendly API errors.

For production, persist the SQLite file on durable storage and back it up consistently. This schema is deliberately small and can later be migrated to a managed relational database.
