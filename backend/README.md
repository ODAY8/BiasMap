# BiasMap Backend

Media & Information Literacy API — Node.js + Express + PostgreSQL + Groq AI.

## Stack

- **Runtime**: Node.js 20 / Express 4
- **Database**: PostgreSQL (`pg` driver, migration files)
- **AI**: [Groq](https://console.groq.com) — `groq-sdk`, model set via `GROQ_MODEL` env var
- **Security**: Helmet, CORS, express-rate-limit, express-validator, sanitize-html

> No authentication required — all endpoints are public.

---

## Quick Start

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, GROQ_API_KEY, GROQ_MODEL
npm run migrate             # create all tables
npm run seed                # seed techniques, badges, daily challenge
npm run dev                 # start on http://localhost:3000
```

---

## Environment Variables

```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-70b-8192
FRONTEND_URL=http://localhost:5173
```

---

## API Reference

Base URL: `http://localhost:3000`

No auth headers required. Error shape: `{ "error": { "message": "...", "code": "..." } }`

### Analyze

```bash
# Analyze text for bias, propaganda, emotional language
POST /api/analyze
{ "text": "...", "source_type": "article|social|speech|blog|caption" }

# List past analyses
GET /api/analyze

# Get single analysis
GET /api/analyze/:id

# Replay analysis sentences
GET /api/analyze/:id/replay

# Detect viewpoints
POST /api/analyze/viewpoints  { "text": "..." }

# Detect emotions
POST /api/analyze/emotion  { "text": "..." }

# Rewrite headline
POST /api/analyze/rewrite-headline  { "headline": "..." }

# Segment claims
POST /api/analyze/segment-claims  { "text": "..." }

# Verify claims (guidance only)
POST /api/analyze/verify-claims  { "text": "..." }

# Source quality
POST /api/analyze/source-quality  { "text": "..." }
```

### Compare

```bash
POST /api/compare
{ "articles": ["article 1 text", "article 2 text"], "event_description": "optional" }

GET /api/compare/:id
```

### Coach

```bash
POST /api/coach/session          # start a new session → { session_id }
POST /api/coach/ask              # { session_id, message }
```

### Learning

```bash
GET /api/learning/topics
GET /api/learning/topics/:topicId/lessons
GET /api/learning/quizzes/:quizId
POST /api/learning/quizzes/:quizId/submit  { "answers": [1, 0, 2] }
```

### Challenges & Gamification

```bash
GET  /api/challenges/today
POST /api/challenges/:id/submit  { "answer": { "technique": "Appeal to Fear" } }
GET  /api/challenges/leaderboard
```

### Progress Dashboard

```bash
GET /api/progress
```

### Reports

```bash
GET    /api/reports
POST   /api/reports           { "title": "My Report", "analysisId": "uuid" }
DELETE /api/reports/:id
GET    /api/reports/:id/export   # returns PDF
GET    /api/reports/:id/share    # returns { share_token }
```

### Propaganda Techniques Library

```bash
GET /api/propaganda-techniques
GET /api/propaganda-techniques/:id
```

### Feedback

```bash
POST /api/feedback  { "message": "...", "category": "bug|suggestion|other" }
```

### Admin

```bash
GET  /api/admin/users
GET  /api/admin/analytics
GET  /api/admin/feedback
GET  /api/admin/reports
POST /api/admin/content  { "type": "topic|lesson|quiz|question", ...fields }
```

---

## Rate Limits

| Route type | Window | Max |
|---|---|---|
| All routes | 15 min | 100 requests |
| AI routes | 1 min | 10 requests |

---

## Architecture

```
src/
  config/         env.js, db.js, groqClient.js, constants.js
  ai/             aiService.js, groqClient.js
  prompts/        One .js file per AI system prompt
  controllers/    HTTP layer — call services, return responses
  services/       Business logic and DB transactions
  models/         DB query layer (pg)
  routes/         Express routers
  middleware/     errorHandler, rateLimiter, validate
  validators/     express-validator rule arrays
  utils/          logger.js, mailer.js
  database/
    migrations/   Numbered .sql files
    seeds/        seed.js
tests/
```

---

## Tests

```bash
npm test
```

Mocks the Groq API — no real API key needed.
