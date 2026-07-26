const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { standard } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { frontendUrl } = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors({ origin: frontendUrl === '*' ? true : frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Public — no token required (no rate limit on auth)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/propaganda-techniques', require('./routes/propagandaRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.get('/api/challenges/leaderboard', require('./routes/challengeRoutes'));

// Rate limit only protected routes
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
