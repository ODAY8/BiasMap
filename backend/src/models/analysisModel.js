const pool = require('../config/db');

const create = async (client, { userId, sourceText, sourceType, scores }) => {
  const { rows } = await client.query(
    `INSERT INTO analyses (user_id, source_text, source_type, scores)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, sourceText, sourceType, JSON.stringify(scores)]
  );
  return rows[0];
};

const insertSentences = async (client, analysisId, sentences) => {
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    await client.query(
      `INSERT INTO analysis_sentences (analysis_id, sentence_text, category, technique, explanation, question, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [analysisId, s.sentence_text, s.category, s.technique, s.explanation, s.question, i]
    );
  }
};

const findById = (id) =>
  pool.query('SELECT * FROM analyses WHERE id = $1', [id]).then(r => r.rows[0]);

const findSentences = (analysisId) =>
  pool.query(
    'SELECT * FROM analysis_sentences WHERE analysis_id = $1 ORDER BY order_index',
    [analysisId]
  ).then(r => r.rows);

const listForUser = (userId, { limit = 20, offset = 0 }) =>
  pool.query(
    'SELECT id, source_type, scores, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  ).then(r => r.rows);

module.exports = { create, insertSentences, findById, findSentences, listForUser };
