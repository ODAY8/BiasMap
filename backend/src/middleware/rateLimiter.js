const rateLimit = require('express-rate-limit');

// General API limit: 500 req / 15 min per authenticated user IP
// Covers read-only endpoints like GET /api/analyze and GET /api/progress
const standard = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 2000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: { error: { message: 'Too many requests', code: 'RATE_LIMITED' } },
});

// Auth limit: 20 req / 15 min — stricter to prevent brute-force
const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many auth attempts, please try again later', code: 'RATE_LIMITED' } },
});

// AI limit: 30 req / min per IP — generous enough for normal use, still protects Groq quota
const aiRoutes = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'AI rate limit exceeded — please wait a moment', code: 'RATE_LIMITED' } },
});

module.exports = { standard, auth, aiRoutes };
