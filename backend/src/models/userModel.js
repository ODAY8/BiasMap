const pool = require('../config/db');

const findByEmail = (email) =>
  pool.query('SELECT * FROM users WHERE email = $1', [email]).then(r => r.rows[0]);

const findById = (id) =>
  pool.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [id]).then(r => r.rows[0]);

const findByGoogleId = (googleId) =>
  pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]).then(r => r.rows[0]);

const create = ({ email, passwordHash, googleId, name, role = 'user' }) =>
  pool.query(
    `INSERT INTO users (email, password_hash, google_id, name, role)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, role, created_at`,
    [email, passwordHash || null, googleId || null, name, role]
  ).then(r => r.rows[0]);

const updatePassword = (id, passwordHash) =>
  pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

const listAll = ({ limit = 50, offset = 0 }) =>
  pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
    .then(r => r.rows);

const countAll = () =>
  pool.query('SELECT COUNT(*) FROM users').then(r => parseInt(r.rows[0].count, 10));

module.exports = { findByEmail, findById, findByGoogleId, create, updatePassword, listAll, countAll };
