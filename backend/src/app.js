const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { standard, auth } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { frontendUrl } = require('./config/env');

const app = express();

// Trust Render's reverse proxy so express-rate-limit sees the real client IP
// Without this, all users share one IP (the proxy) and hit the limit together
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: frontendUrl === '*' ? true : frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health check — exempt from rate limiting so Render uptime checks never 429
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Auth routes get a stricter dedicated limiter (brute-force protection)
app.use('/api/auth', auth, require('./routes/authRoutes'));

// Public routes — no auth, no rate limit
app.use('/api/propaganda-techniques', require('./routes/propagandaRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.get('/api/challenges/leaderboard', require('./routes/challengeRoutes'));

// Standard rate limit applied to all protected routes
app.use(standard);

// Protected — valid JWT required (works for both registered users and guests)
app.use('/api/analyze', authenticate, require('./routes/analyzeRoutes'));
app.use('/api/compare', authenticate, require('./routes/compareRoutes'));
app.use('/api/coach', authenticate, require('./routes/coachRoutes'));
app.use('/api/challenges', authenticate, require('./routes/challengeRoutes'));
app.use('/api/reports', authenticate, require('./routes/reportsRoutes'));
app.use('/api/progress', authenticate, require('./routes/progressRoutes'));
app.use('/api/admin', authenticate, require('./routes/adminRoutes'));
app.post('/api/feedback', require('./controllers/adminController').submitFeedback);

app.use(errorHandler);

module.exports = app;
