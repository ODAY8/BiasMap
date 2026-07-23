const router = require('express').Router();
const { asyncHandler, ApiError } = require('../middleware/errors');
const { body, pagination, optionalNumber, requiredString, optionalString, integerId, status } = require('../validation');
const { findOr404, listResult, parseBounds } = require('./utils');

const select = `SELECT r.*, c.name AS category_name, s.name AS source_name
  FROM reports r LEFT JOIN categories c ON c.id = r.category_id
  LEFT JOIN sources s ON s.id = r.source_id`;

function reportInput(req, partial = false) {
  const input = body(req);
  const result = {};
  if (!partial || input.title !== undefined) result.title = requiredString(input.title, 'title', 200);
  if (!partial || input.description !== undefined) result.description = requiredString(input.description, 'description');
  if (!partial || input.latitude !== undefined) result.latitude = optionalNumber(input.latitude, 'latitude', -90, 90);
  if (!partial || input.longitude !== undefined) result.longitude = optionalNumber(input.longitude, 'longitude', -180, 180);
  if (result.latitude === null || result.longitude === null) throw new ApiError(400, 'latitude and longitude are required and cannot be null');
  if (!partial || input.severity !== undefined) result.severity = optionalNumber(input.severity, 'severity', 1, 5);
  if (result.severity !== undefined && !Number.isInteger(result.severity)) throw new ApiError(400, 'severity must be an integer from 1 to 5');
  if (input.category_id !== undefined) result.category_id = input.category_id === null ? null : integerId(input.category_id, 'category_id');
  if (input.source_id !== undefined) result.source_id = input.source_id === null ? null : integerId(input.source_id, 'source_id');
  if (input.status !== undefined || !partial) result.status = status(input.status);
  if (input.location_name !== undefined) result.location_name = optionalString(input.location_name, 'location_name', 200);
  if (input.evidence !== undefined) result.evidence = optionalString(input.evidence, 'evidence');
  if (input.reported_at !== undefined) result.reported_at = optionalString(input.reported_at, 'reported_at', 40);
  return result;
}

router.get('/', asyncHandler((req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const where = [], params = [];
  const search = req.query.q || req.query.search;
  if (search) { where.push('(r.title LIKE ? OR r.description LIKE ? OR r.location_name LIKE ?)'); const q = `%${search}%`; params.push(q, q, q); }
  if (req.query.category_id) { where.push('r.category_id = ?'); params.push(integerId(req.query.category_id, 'category_id')); }
  if (req.query.status) { where.push('r.status = ?'); params.push(status(req.query.status)); }
  const bounds = parseBounds(req.query);
  for (const [column, value, operator] of [['latitude', bounds.minLat, '>='], ['latitude', bounds.maxLat, '<='], ['longitude', bounds.minLng, '>='], ['longitude', bounds.maxLng, '<=']]) {
    if (value !== undefined) { where.push(`r.${column} ${operator} ?`); params.push(value); }
  }
  const condition = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const db = req.app.locals.db;
  const total = db.prepare(`SELECT COUNT(*) AS count FROM reports r${condition}`).get(...params).count;
  const rows = db.prepare(`${select}${condition} ORDER BY r.reported_at DESC, r.id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json(listResult(rows, total, page, limit));
}));

router.get('/:id', asyncHandler((req, res) => {
  const db = req.app.locals.db;
  const record = db.prepare(`${select} WHERE r.id = ?`).get(integerId(req.params.id));
  if (!record) throw new ApiError(404, 'report not found');
  res.json({ data: record });
}));

router.post('/', asyncHandler((req, res) => {
  const input = reportInput(req);
  const db = req.app.locals.db;
  const result = db.prepare(`INSERT INTO reports
    (title, description, category_id, source_id, latitude, longitude, location_name, severity, status, evidence, reported_at)
    VALUES (@title, @description, @category_id, @source_id, @latitude, @longitude, @location_name, @severity, @status, @evidence, COALESCE(@reported_at, datetime('now')))`
  ).run({ category_id: null, source_id: null, location_name: null, evidence: null, reported_at: null, ...input });
  res.status(201).json({ data: db.prepare(`${select} WHERE r.id = ?`).get(result.lastInsertRowid) });
}));

router.patch('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const input = reportInput(req, true);
  const db = req.app.locals.db;
  findOr404(db, 'reports', id);
  const fields = Object.keys(input);
  if (!fields.length) throw new ApiError(400, 'at least one field is required');
  const values = { id, ...input };
  db.prepare(`UPDATE reports SET ${fields.map((field) => `${field} = @${field}`).join(', ')}, updated_at = datetime('now') WHERE id = @id`).run(values);
  res.json({ data: db.prepare(`${select} WHERE r.id = ?`).get(id) });
}));

router.delete('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const result = req.app.locals.db.prepare('DELETE FROM reports WHERE id = ?').run(id);
  if (!result.changes) throw new ApiError(404, 'report not found');
  res.status(204).send();
}));

module.exports = router;
