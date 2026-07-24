const pool = require('../../config/db');
const aiService = require('../../ai/aiService');
const comparisonModel = require('../../models/comparisonModel');
const sanitizeHtml = require('sanitize-html');

const clean = (t) => sanitizeHtml(t, { allowedTags: [], allowedAttributes: {} });

const compare = async (userId, articles, eventDescription) => {
  const cleanArticles = articles.map(clean);
  const result = await aiService.compareArticles(cleanArticles);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const comp = await comparisonModel.create(client, { userId, eventDescription });
    await comparisonModel.insertArticles(client, comp.id, cleanArticles, result.articles);
    await comparisonModel.updateResult(client, comp.id, result);
    await client.query('COMMIT');
    return { id: comp.id, ...result };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getComparison = async (id, userId) => {
  const comp = await comparisonModel.findById(id);
  if (!comp) { const e = new Error('Comparison not found'); e.status = 404; throw e; }
  if (comp.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  return comp;
};

module.exports = { compare, getComparison };
