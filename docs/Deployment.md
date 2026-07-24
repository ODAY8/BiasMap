# BiasMap Deployment Guide

## Stack
- Backend: Node.js 20 + Express on port 3000
- Database: PostgreSQL 16 (Supabase in production, Docker locally)
- AI: Groq API (external — no self-hosting needed)
- Frontend: React + Vite (static files, any CDN/host)

---

## Option 1 — Local Development (no Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally or a free [Supabase](https://supabase.com) project

### Steps

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/biasmap
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-70b-8192
FRONTEND_URL=http://localhost:5173
```

```bash
npm run migrate   # creates all tables
npm run seed      # seeds propaganda techniques, badges, daily challenge
npm run dev       # starts on http://localhost:3000
```

---

## Option 2 — Local Development with Docker

### Prerequisites
- Docker Desktop

### Steps

```bash
# copy and fill in your Groq key
cp backend/.env.example .env
# set at minimum:
# GROQ_API_KEY=gsk_...

docker compose up -d
```

Then run migrations inside the container:
```bash
docker compose exec backend node src/database/migrate.js
docker compose exec backend node src/database/seeds/seed.js
```

Backend is available at `http://localhost:3000`.
To stop: `docker compose down`
To wipe the database volume: `docker compose down -v`

---

## Option 3 — Production on Railway (recommended, free tier available)

1. Push your repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a **PostgreSQL** plugin to your project
4. Set these environment variables in Railway:

| Variable | Value |
|---|---|
| `DATABASE_URL` | auto-filled by Railway PostgreSQL plugin |
| `GROQ_API_KEY` | your Groq key |
| `GROQ_MODEL` | `llama3-70b-8192` |
| `FRONTEND_URL` | your frontend URL e.g. `https://biasmap.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

5. Set the **root directory** to `backend` and **start command** to `node src/server.js`
6. After first deploy, run migrations via Railway shell:
```bash
node src/database/migrate.js
node src/database/seeds/seed.js
```

---

## Option 4 — Production on Render (free tier available)

1. Go to [render.com](https://render.com) → New Web Service → connect GitHub repo
2. Set **Root Directory** to `backend`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node src/server.js`
5. Add a **PostgreSQL** database from Render dashboard
6. Set environment variables (same as Railway table above)
7. After deploy, open the Render shell and run:
```bash
node src/database/migrate.js
node src/database/seeds/seed.js
```

---

## Option 5 — Production on Supabase + Vercel/Netlify

Use **Supabase** for the database and deploy the backend to **Railway or Render** as above.

For the Supabase `DATABASE_URL`:
1. Go to Supabase project → Settings → Database
2. Copy the **Connection string (URI)** — use the **pooler** URL for production
3. Paste as `DATABASE_URL` in your backend env

Run migrations from your local machine pointing at Supabase:
```bash
cd backend
DATABASE_URL=postgresql://... node src/database/migrate.js
DATABASE_URL=postgresql://... node src/database/seeds/seed.js
```

---

## Frontend Deployment (Vercel — recommended)

```bash
cd frontend
npm install
npm run build   # outputs to dist/
```

Deploy `dist/` to [Vercel](https://vercel.com):
1. Import GitHub repo → set **Root Directory** to `frontend`
2. Framework preset: **Vite**
3. Add environment variable:
   - `VITE_API_URL` = your backend URL e.g. `https://biasmap-backend.railway.app`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GROQ_API_KEY` | ✅ | From [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | ✅ | e.g. `llama3-70b-8192` |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS e.g. `https://biasmap.vercel.app` |
| `PORT` | optional | Defaults to `3000` |
| `NODE_ENV` | optional | `development` or `production` |

---

## Health Check

```bash
curl http://localhost:3000/api/propaganda-techniques
# should return a JSON array of 12 techniques
```

---

## Database Migrations

Migrations are idempotent — safe to run multiple times:
```bash
npm run migrate
```

Files in `src/database/migrations/` are applied in order by filename. To add a new migration, create `009_your_change.sql`.

---

## Rate Limits

| Route type | Window | Max |
|---|---|---|
| All routes | 15 min | 100 requests |
| AI routes (`/analyze`, `/compare`, `/coach/ask`, etc.) | 1 min | 10 requests |
