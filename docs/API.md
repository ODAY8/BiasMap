# BiasMap API

The JSON REST API runs on port `3000` by default. All resource endpoints are under `/api`. List responses use `{ "data": [], "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 } }`; single resources use `{ "data": {} }`.

## Health

- `GET /health` (also `/api/health`) returns service status.

## Reports and markers

Reports contain `title`, `description`, `latitude`, `longitude`, and optionally `category_id`, `source_id`, `location_name`, `severity` (1–5), `status`, `evidence`, and `reported_at`. Markers are lightweight map points with `title`, coordinates, and optional `report_id`, `description`, `category_id`, `severity`, and `status`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/reports` | Paginated list/search |
| POST | `/api/reports` | Create a report |
| GET/PATCH/DELETE | `/api/reports/:id` | Read, update, or remove |
| GET | `/api/markers` | Paginated list/search |
| POST | `/api/markers` | Create a marker |
| GET/PATCH/DELETE | `/api/markers/:id` | Read, update, or remove |

`q` searches text. Both list endpoints support `page`, `limit` (maximum 100), `category_id`, `status`, and map bounds `minLat`, `maxLat`, `minLng`, `maxLng`. Markers also support `report_id`.

## Categories and sources

`/api/categories` and `/api/sources` each support `GET`, `POST`, `GET/:id`, `PATCH/:id`, and `DELETE/:id`. Category creation requires `name` and supports `description` and `color`. Source creation requires `name` and supports a validated `url`, `publisher`, and `accessed_at`. These lists support `q`, `page`, and `limit`.

Deleting a category or source leaves reports and markers intact and clears their foreign-key reference.

## Map summary

- `GET /api/map` or `GET /api/map/summary`
- Alias: `GET /api/map-summary`

Returns marker count, average severity, coordinate bounds, and counts by category/status. The same map-bound query parameters and optional `status` filter apply.

## Errors

Errors always return JSON, for example:

```json
{ "error": { "message": "title is required..." } }
```

There is no authentication or authorization layer in this version.
