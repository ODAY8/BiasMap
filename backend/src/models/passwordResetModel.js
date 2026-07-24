const pool = require('../config/db');
const crypto = require('crypto');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

const save = (userId, token, expiresAt) =>
  pool.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
    [userId, hash(token), expiresAt]
  );

const find = (token) =>
  pool.query(
    'SELECT * FROM password_resets WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE',
    [hash(token)]
  ).then(r => r.rows[0]);

const markUsed = (id) =>
  pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [id]);

module.exports = { save, find, markUsed };
