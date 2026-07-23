const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { createDatabase } = require('./db/database');
const { errorHandler, notFound } = require('./middleware/errors');
const reportRoutes = require('./routes/reports');
const markerRoutes = require('./routes/markers');
const categoryRoutes = require('./routes/categories');
const sourceRoutes = require('./routes/sources');
const mapRoutes = require('./routes/map');

function createApp(options = {}) {
  const app = express();
  const db = options.db || createDatabase(options);

  app.locals.db = db;
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'combined'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  const health = (_req, res) => res.json({
    status: 'ok',
    service: 'biasmap-api',
    timestamp: new Date().toISOString()
  });
  app.get('/health', health);
  app.get('/api/health', health);

  app.use('/api/reports', reportRoutes);
  app.use('/api/markers', markerRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/sources', sourceRoutes);
  app.use('/api/map', mapRoutes);
  app.use('/api/map-summary', mapRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
