const router = require('express').Router();
const { asyncHandler, ApiError } = require('../middleware/errors');
const { body, pagination, optionalNumber, requiredString, optionalString, integerId, status } = require('../validation');
const { findOr404, listResult, parseBounds } = require('./utils');

const select = `SELECT m.*, c.name AS category_name
  FROM markers m LEFT JOIN categories c ON c.id = m.category_id`;

function markerInput(req, partial = false) {
  const input = body(req);
  const result = {};
  if (!partial || input.title !== undefined) result.title = requiredString(input.title, 'title', 200);
  if (input.description !== undefined) result.description = optionalString(input.description, 'description');
  if (!partial || input.latitude !== undefined) result.latitude = optionalNumber(input.latitude, 'latitude', -90, 90);
  if (!partial || input.longitude !== undefined) result.longitude = optionalNumber(input.longitude, 'longitude', -180, 180);
  if (result.latitude === null || result.longitude === null) throw new ApiError(400, 'latitude and longitude are required and cannot be null');
  if (input.severity !== undefined || !partial) result.severity = optionalNumber(input.severity === undefined ? 3 : input.severity, 'severity', 1, 5);
  if (!Number.isInteger(result.severity)) throw new ApiError(400, 'severity must be an integer from 1 to 5');
  if (input.category_id !== undefined) result.category_id = input.category_id === null ? null : integerId(input.category_id, 'category_id');
  if (input.report_id !== undefined) result.report_id = input.report_id === null ? null : integerId(input.report_id, 'report_id');
  if (input.status !== undefined || !partial) result.status = status(input.status);
  return result;
}

router.get('/', asyncHandler((req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const where = [], params = [];
  const search = req.query.q || req.query.search;
  if (search) { where.push('(m.title LIKE ? OR m.description LIKE ?)'); const q = `%${search}%`; params.push(q, q); }
  if (req.query.category_id) { where.push('m.category_id = ?'); params.push(integerId(req.query.category_id, 'category_id')); }
  if (req.query.status) { where.push('m.status = ?'); params.push(status(req.query.status)); }
  if (req.query.report_id) { where.push('m.report_id = ?'); params.push(integerId(req.query.report_id, 'report_id')); }
  const bounds = parseBounds(req.query);
  for (const [column, value, operator] of [['latitude', bounds.minLat, '>='], ['latitude', bounds.maxLat, '<='], ['longitude', bounds.minLng, '>='], ['longitude', bounds.maxLng, '<=']]) {
    if (value !== undefined) { where.push(`m.${column} ${operator} ?`); params.push(value); }
  }
  const condition = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const db = req.app.locals.db;
  const total = db.prepare(`SELECT COUNT(*) AS count FROM markers m${condition}`).get(...params).count;
  const rows = db.prepare(`${select}${condition} ORDER BY m.created_at DESC, m.id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json(listResult(rows, total, page, limit));
}));

router.get('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const record = req.app.locals.db.prepare(`${select} WHERE m.id = ?`).get(id);
  if (!record) throw new ApiError(404, 'marker not found');
  res.json({ data: record });
}));

router.post('/', asyncHandler((req, res) => {
  const input = markerInput(req);
  const db = req.app.locals.db;
  const result = db.prepare(`INSERT INTO markers
    (report_id, title, description, category_id, latitude, longitude, severity, status)
    VALUES (@report_id, @title, @description, @category_id, @latitude, @longitude, @severity, @status)`
  ).run({ report_id: null, description: null, category_id: null, ...input });
  res.status(201).json({ data: db.prepare(`${select} WHERE m.id = ?`).get(result.lastInsertRowid) });
}));

router.patch('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const input = markerInput(req, true);
  const db = req.app.locals.db;
  findOr404(db, 'markers', id);
  const fields = Object.keys(input);
  if (!fields.length) throw new ApiError(400, 'at least one field is required');
  db.prepare(`UPDATE markers SET ${fields.map((field) => `${field} = @${field}`).join(', ')}, updated_at = datetime('now') WHERE id = @id`).run({ id, ...input });
  res.json({ data: db.prepare(`${select} WHERE m.id = ?`).get(id) });
}));

router.delete('/:id', asyncHandler((req, res) => {
  const result = req.app.locals.db.prepare('DELETE FROM markers WHERE id = ?').run(integerId(req.params.id));
  if (!result.changes) throw new ApiError(404, 'marker not found');
  res.status(204).send();
}));

module.exports = router;
