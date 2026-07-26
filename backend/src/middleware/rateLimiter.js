const rateLimit = require('express-rate-limit');

const standard = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests', code: 'RATE_LIMITED' } },
});

const aiRoutes = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'AI rate limit exceeded — please wait a moment', code: 'RATE_LIMITED' } },
});

module.exports = { standard, aiRoutes };
