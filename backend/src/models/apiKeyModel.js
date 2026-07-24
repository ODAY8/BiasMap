const pool = require('../config/db');
const crypto = require('crypto');

const hash = (key) => crypto.createHash('sha256').update(key).digest('hex');

const create = (userId, name) => {
  const key = 'bm_' + crypto.randomBytes(32).toString('hex');
  return pool.query(
    'INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1,$2,$3)',
    [userId, hash(key), name]
  ).then(() => key); // return raw key ONCE — never stored plain
};

const findByKey = (key) =>
  pool.query(
    `SELECT ak.*, u.id as uid, u.email, u.name as user_name, u.role
     FROM api_keys ak
     JOIN users u ON u.id = ak.user_id
     WHERE ak.key_hash = $1`,
    [hash(key)]
  ).then(r => r.rows[0]);

const updateLastUsed = (id) =>
  pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [id]);

const listForUser = (userId) =>
  pool.query(
    'SELECT id, name, created_at, last_used_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  ).then(r => r.rows);

const revoke = (id, userId) =>
  pool.query('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [id, userId]);

module.exports = { create, findByKey, updateLastUsed, listForUser, revoke };
