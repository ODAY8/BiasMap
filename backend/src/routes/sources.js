const router = require('express').Router();
const { asyncHandler, ApiError } = require('../middleware/errors');
const { body, pagination, requiredString, optionalString, integerId } = require('../validation');
const { findOr404, listResult } = require('./utils');

function url(value) {
  if (value === undefined || value === null || value === '') return null;
  const result = optionalString(value, 'url', 2000);
  try { if (result) new URL(result); } catch { throw new ApiError(400, 'url must be a valid URL'); }
  return result;
}

function sourceInput(input, partial) {
  const result = {};
  if (!partial || input.name !== undefined) result.name = requiredString(input.name, 'name', 200);
  if (input.url !== undefined) result.url = url(input.url);
  if (input.publisher !== undefined) result.publisher = optionalString(input.publisher, 'publisher', 200);
  if (input.accessed_at !== undefined) result.accessed_at = optionalString(input.accessed_at, 'accessed_at', 40);
  return result;
}

router.get('/', asyncHandler((req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const db = req.app.locals.db;
  const params = [];
  let condition = '';
  if (req.query.q) { condition = 'WHERE name LIKE ? OR publisher LIKE ?'; const q = `%${req.query.q}%`; params.push(q, q); }
  const total = db.prepare(`SELECT COUNT(*) AS count FROM sources ${condition}`).get(...params).count;
  const rows = db.prepare(`SELECT * FROM sources ${condition} ORDER BY name LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json(listResult(rows, total, page, limit));
}));

router.get('/:id', asyncHandler((req, res) => {
  const record = findOr404(req.app.locals.db, 'sources', integerId(req.params.id));
  res.json({ data: record });
}));

router.post('/', asyncHandler((req, res) => {
  const input = sourceInput(body(req), false);
  const db = req.app.locals.db;
  const result = db.prepare('INSERT INTO sources (name, url, publisher, accessed_at) VALUES (@name, @url, @publisher, @accessed_at)').run({ url: null, publisher: null, accessed_at: null, ...input });
  res.status(201).json({ data: db.prepare('SELECT * FROM sources WHERE id = ?').get(result.lastInsertRowid) });
}));

router.patch('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const input = sourceInput(body(req), true);
  const db = req.app.locals.db;
  findOr404(db, 'sources', id);
  const fields = Object.keys(input);
  if (!fields.length) throw new ApiError(400, 'at least one field is required');
  db.prepare(`UPDATE sources SET ${fields.map((field) => `${field} = @${field}`).join(', ')}, updated_at = datetime('now') WHERE id = @id`).run({ id, ...input });
  res.json({ data: db.prepare('SELECT * FROM sources WHERE id = ?').get(id) });
}));

router.delete('/:id', asyncHandler((req, res) => {
  const result = req.app.locals.db.prepare('DELETE FROM sources WHERE id = ?').run(integerId(req.params.id));
  if (!result.changes) throw new ApiError(404, 'source not found');
  res.status(204).send();
}));

module.exports = router;
