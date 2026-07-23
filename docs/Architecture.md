# Architecture

The backend is a small layered Express service:

```text
src/server.js
  -> src/app.js
      -> middleware (security, logging, JSON errors)
      -> routes (reports, markers, categories, sources, map)
      -> validation helpers
      -> db/database.js (SQLite lifecycle and schema bootstrap)
```

`createApp({ db })` is exported so tests can use an in-memory database without starting a network listener. Production startup owns the database connection and closes it on `SIGINT`/`SIGTERM`. Route handlers use parameterized SQL for values; dynamic clauses are assembled only from fixed field names.

Helmet, CORS, request-size limits, and Morgan are enabled by default. This is not an authentication system: there are no accounts, sessions, tokens, or authorization checks. Put a gateway, network policy, or future identity middleware in front of write endpoints when deploying beyond a trusted environment.
