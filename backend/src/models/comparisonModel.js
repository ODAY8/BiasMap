const pool = require('../config/db');

const create = async (client, { userId, eventDescription }) => {
  const { rows } = await client.query(
    'INSERT INTO comparisons (user_id, event_description) VALUES ($1,$2) RETURNING *',
    [userId, eventDescription || null]
  );
  return rows[0];
};

const insertArticles = async (client, comparisonId, articles, results) => {
  for (let i = 0; i < articles.length; i++) {
    await client.query(
      'INSERT INTO comparison_articles (comparison_id, source_text, result, order_index) VALUES ($1,$2,$3,$4)',
      [comparisonId, articles[i], JSON.stringify(results[i] || null), i]
    );
  }
};

const updateResult = (client, id, result) =>
  client.query('UPDATE comparisons SET result = $1 WHERE id = $2', [JSON.stringify(result), id]);

const findById = async (id) => {
  const comp = await pool.query('SELECT * FROM comparisons WHERE id = $1', [id]).then(r => r.rows[0]);
  if (!comp) return null;
  comp.articles = await pool.query(
    'SELECT * FROM comparison_articles WHERE comparison_id = $1 ORDER BY order_index',
    [id]
  ).then(r => r.rows);
  return comp;
};

module.exports = { create, insertArticles, updateResult, findById };
