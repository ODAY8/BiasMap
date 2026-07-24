const pool = require('../config/db');

const createSession = (userId) =>
  pool.query('INSERT INTO coach_sessions (user_id) VALUES ($1) RETURNING *', [userId])
    .then(r => r.rows[0]);

const findSession = (id) =>
  pool.query('SELECT * FROM coach_sessions WHERE id = $1', [id]).then(r => r.rows[0]);

const getMessages = (sessionId, limit = 20) =>
  pool.query(
    'SELECT role, content FROM coach_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2',
    [sessionId, limit]
  ).then(r => r.rows.reverse());

const addMessage = (sessionId, role, content) =>
  pool.query(
    'INSERT INTO coach_messages (session_id, role, content) VALUES ($1,$2,$3) RETURNING *',
    [sessionId, role, content]
  ).then(r => r.rows[0]);

module.exports = { createSession, findSession, getMessages, addMessage };
