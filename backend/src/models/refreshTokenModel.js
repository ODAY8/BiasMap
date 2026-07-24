const pool = require('../config/db');
const crypto = require('crypto');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

const save = (userId, token, expiresAt) =>
  pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
    [userId, hash(token), expiresAt]
  );

const find = (token) =>
  pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [hash(token)]
  ).then(r => r.rows[0]);

const revoke = (token) =>
  pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash(token)]);

const revokeAllForUser = (userId) =>
  pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

module.exports = { save, find, revoke, revokeAllForUser };
