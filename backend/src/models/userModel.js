const pool = require('../config/db');

const findByEmail = (email) =>
  pool.query('SELECT * FROM users WHERE email = $1', [email]).then(r => r.rows[0]);

const findById = (id) =>
  pool.query('SELECT id, email, name, role, is_guest, created_at FROM users WHERE id = $1', [id]).then(r => r.rows[0]);

const create = ({ email, passwordHash, name, isGuest = false, role = 'user' }) =>
  pool.query(
    `INSERT INTO users (email, password_hash, name, is_guest, role)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, role, is_guest, created_at`,
    [email || null, passwordHash || null, name, isGuest, role]
  ).then(r => r.rows[0]);

const updatePassword = (id, passwordHash) =>
  pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

const listAll = ({ limit = 50, offset = 0 }) =>
  pool.query(
    'SELECT id, email, name, role, is_guest, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  ).then(r => r.rows);

const countAll = () =>
  pool.query('SELECT COUNT(*) FROM users').then(r => parseInt(r.rows[0].count, 10));

module.exports = { findByEmail, findById, create, updatePassword, listAll, countAll };
