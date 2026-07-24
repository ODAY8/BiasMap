const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const list = (userId) =>
  pool.query('SELECT * FROM saved_reports WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    .then(r => r.rows);

const findById = (id) =>
  pool.query('SELECT * FROM saved_reports WHERE id = $1', [id]).then(r => r.rows[0]);

const findByShareToken = (token) =>
  pool.query('SELECT * FROM saved_reports WHERE share_token = $1', [token]).then(r => r.rows[0]);

const create = ({ userId, analysisId, title }) =>
  pool.query(
    'INSERT INTO saved_reports (user_id, analysis_id, title, share_token) VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, analysisId || null, title, uuidv4()]
  ).then(r => r.rows[0]);

const remove = (id, userId) =>
  pool.query('DELETE FROM saved_reports WHERE id = $1 AND user_id = $2', [id, userId]);

module.exports = { list, findById, findByShareToken, create, remove };
