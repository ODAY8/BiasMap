const router = require('express').Router();
const { asyncHandler } = require('../middleware/errors');
const { parseBounds } = require('./utils');
const { status } = require('../validation');

function summary(req, res) {
  const bounds = parseBounds(req.query);
  const clauses = [], params = [];
  for (const [column, value, operator] of [['latitude', bounds.minLat, '>='], ['latitude', bounds.maxLat, '<='], ['longitude', bounds.minLng, '>='], ['longitude', bounds.maxLng, '<=']]) {
    if (value !== undefined) { clauses.push(`m.${column} ${operator} ?`); params.push(value); }
  }
  if (req.query.status) { clauses.push('m.status = ?'); params.push(status(req.query.status)); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const db = req.app.locals.db;
  const totals = db.prepare(`SELECT COUNT(*) AS total, AVG(m.severity) AS average_severity,
    MIN(m.latitude) AS min_latitude, MAX(m.latitude) AS max_latitude,
    MIN(m.longitude) AS min_longitude, MAX(m.longitude) AS max_longitude
    FROM markers m ${where}`).get(...params);
  const byCategory = db.prepare(`SELECT COALESCE(c.name, 'Uncategorized') AS category,
    COUNT(*) AS count FROM markers m LEFT JOIN categories c ON c.id = m.category_id
    ${where} GROUP BY c.id, c.name ORDER BY count DESC`).all(...params);
  const byStatus = db.prepare(`SELECT status, COUNT(*) AS count FROM markers m ${where} GROUP BY status ORDER BY count DESC`).all(...params);
  res.json({
    data: {
      total: totals.total,
      average_severity: totals.average_severity === null ? null : Number(totals.average_severity.toFixed(2)),
      bounds: {
        min_latitude: totals.min_latitude,
        max_latitude: totals.max_latitude,
        min_longitude: totals.min_longitude,
        max_longitude: totals.max_longitude
      },
      by_category: byCategory,
      by_status: byStatus
    }
  });
}

router.get('/', asyncHandler(summary));
router.get('/summary', asyncHandler(summary));

module.exports = router;
