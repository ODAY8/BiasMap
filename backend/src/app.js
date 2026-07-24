const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { standard } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { frontendUrl } = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors({ origin: frontendUrl === '*' ? true : frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(standard);

// All routes are public — no authentication required
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));
app.use('/api/propaganda-techniques', require('./routes/propagandaRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/analyze', require('./routes/analyzeRoutes'));
app.use('/api/compare', require('./routes/compareRoutes'));
app.use('/api/coach', require('./routes/coachRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.post('/api/feedback', require('./controllers/adminController').submitFeedback);

app.use(errorHandler);

module.exports = app;
