const router = require('express').Router();
const { asyncHandler, ApiError } = require('../middleware/errors');
const { body, pagination, requiredString, optionalString, integerId } = require('../validation');
const { findOr404, listResult } = require('./utils');

router.get('/', asyncHandler((req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const db = req.app.locals.db;
  const params = [];
  let condition = '';
  if (req.query.q) { condition = 'WHERE name LIKE ? OR description LIKE ?'; const q = `%${req.query.q}%`; params.push(q, q); }
  const total = db.prepare(`SELECT COUNT(*) AS count FROM categories ${condition}`).get(...params).count;
  const rows = db.prepare(`SELECT * FROM categories ${condition} ORDER BY name LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json(listResult(rows, total, page, limit));
}));

router.get('/:id', asyncHandler((req, res) => {
  const record = findOr404(req.app.locals.db, 'categories', integerId(req.params.id));
  res.json({ data: record });
}));

router.post('/', asyncHandler((req, res) => {
  const input = body(req);
  const name = requiredString(input.name, 'name', 100);
  const description = optionalString(input.description, 'description', 1000);
  const color = optionalString(input.color, 'color', 30);
  const db = req.app.locals.db;
  const result = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)').run(name, description, color);
  res.status(201).json({ data: db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) });
}));

router.patch('/:id', asyncHandler((req, res) => {
  const id = integerId(req.params.id);
  const input = body(req);
  findOr404(req.app.locals.db, 'categories', id);
  const fields = [];
  const values = { id };
  if (input.name !== undefined) { fields.push('name = @name'); values.name = requiredString(input.name, 'name', 100); }
  if (input.description !== undefined) { fields.push('description = @description'); values.description = optionalString(input.description, 'description', 1000); }
  if (input.color !== undefined) { fields.push('color = @color'); values.color = optionalString(input.color, 'color', 30); }
  if (!fields.length) throw new ApiError(400, 'at least one field is required');
  const db = req.app.locals.db;
  db.prepare(`UPDATE categories SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = @id`).run(values);
  res.json({ data: db.prepare('SELECT * FROM categories WHERE id = ?').get(id) });
}));

router.delete('/:id', asyncHandler((req, res) => {
  const result = req.app.locals.db.prepare('DELETE FROM categories WHERE id = ?').run(integerId(req.params.id));
  if (!result.changes) throw new ApiError(404, 'category not found');
  res.status(204).send();
}));

module.exports = router;
