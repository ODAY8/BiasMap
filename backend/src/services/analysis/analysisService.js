const pool = require('../../config/db');
const aiService = require('../../ai/aiService');
const analysisModel = require('../../models/analysisModel');
const progressModel = require('../../models/progressModel');
const { updateStreak } = require('../dashboard/progressService');
const sanitizeHtml = require('sanitize-html');

const analyze = async (userId, sourceText, sourceType) => {
  const clean = sanitizeHtml(sourceText, { allowedTags: [], allowedAttributes: {} });
  const result = await aiService.analyzeText(clean);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const analysis = await analysisModel.create(client, { userId, sourceText: clean, sourceType, scores: result.scores });
    await analysisModel.insertSentences(client, analysis.id, result.sentences);
    await client.query('COMMIT');
    await progressModel.incrementAnalyzed(userId).catch(() => {});
    await updateStreak(userId).catch(() => {});
    return { ...analysis, sentences: result.sentences };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getReplay = async (analysisId, userId) => {
  const analysis = await analysisModel.findById(analysisId);
  if (!analysis) { const e = new Error('Analysis not found'); e.status = 404; throw e; }
  if (analysis.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  const sentences = await analysisModel.findSentences(analysisId);
  return { analysis, sentences };
};

const getById = async (id) => analysisModel.findById(id);

const listForUser = async (userId) => {
  return analysisModel.listForUser(userId, { limit: 50 });
};

module.exports = { analyze, getReplay, getById, listForUser };
