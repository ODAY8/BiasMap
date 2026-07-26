const pool = require('../config/db');

const findByEmail = (email) =>
  pool.query('SELECT * FROM users WHERE email = $1', [email]).then(r => r.rows[0]);

const findById = (id) =>
  pool.query('SELECT id, email, name, role, is_guest, created_at FROM users WHERE id = $1', [id]).then(r => r.rows[0]);

const findByGoogleId = (googleId) =>
  pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]).then(r => r.rows[0]);

const findByFacebookId = (facebookId) =>
  pool.query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]).then(r => r.rows[0]);

const create = ({ email, passwordHash, name, isGuest = false, role = 'user', googleId = null, facebookId = null }) =>
  pool.query(
    `INSERT INTO users (email, password_hash, name, is_guest, role, google_id, facebook_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, name, role, is_guest, created_at`,
    [email || null, passwordHash || null, name, isGuest, role, googleId, facebookId]
  ).then(r => r.rows[0]);

const updateOAuth = (id, { googleId, facebookId }) =>
  pool.query(
    `UPDATE users SET
       google_id   = COALESCE($2, google_id),
       facebook_id = COALESCE($3, facebook_id)
     WHERE id = $1`,
    [id, googleId || null, facebookId || null]
  );

const updatePassword = (id, passwordHash) =>
  pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

const listAll = ({ limit = 50, offset = 0 }) =>
  pool.query(
    'SELECT id, email, name, role, is_guest, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  ).then(r => r.rows);

const countAll = () =>
  pool.query('SELECT COUNT(*) FROM users').then(r => parseInt(r.rows[0].count, 10));

module.exports = { findByEmail, findById, findByGoogleId, findByFacebookId, create, updateOAuth, updatePassword, listAll, countAll };
