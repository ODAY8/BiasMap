const pool = require('../config/db');

const get = (userId) =>
  pool.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]).then(r => r.rows[0]);

const upsert = (userId, fields) => {
  const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ');
  const vals = Object.values(fields);
  return pool.query(
    `INSERT INTO user_progress (user_id, ${Object.keys(fields).join(', ')})
     VALUES ($1, ${vals.map((_, i) => `$${i + 2}`).join(', ')})
     ON CONFLICT (user_id) DO UPDATE SET ${sets}, updated_at = NOW()`,
    [userId, ...vals]
  );
};

const incrementAnalyzed = (userId) =>
  pool.query(
    `INSERT INTO user_progress (user_id, articles_analyzed) VALUES ($1, 1)
     ON CONFLICT (user_id) DO UPDATE SET articles_analyzed = user_progress.articles_analyzed + 1, updated_at = NOW()`,
    [userId]
  );

module.exports = { get, upsert, incrementAnalyzed };
