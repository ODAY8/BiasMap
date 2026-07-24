const adminService = require('../services/admin/adminService');
const pool = require('../config/db');

const listUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const [users, total] = await Promise.all([adminService.listUsers({ limit, offset }), adminService.countUsers()]);
    res.json({ users, total });
  } catch (err) { next(err); }
};

const listAnalyses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    res.json(await adminService.listAnalyses({ limit, offset }));
  } catch (err) { next(err); }
};

const getAnalytics = async (req, res, next) => {
  try { res.json(await adminService.getAnalytics()); } catch (err) { next(err); }
};

const listFeedback = async (req, res, next) => {
  try { res.json(await adminService.listFeedback({})); } catch (err) { next(err); }
};

const createContent = async (req, res, next) => {
  try {
    const { type, ...data } = req.body;
    let result;
    if (type === 'topic') result = await adminService.createTopic(data);
    else if (type === 'lesson') result = await adminService.createLesson(data);
    else if (type === 'quiz') result = await adminService.createQuiz(data);
    else if (type === 'question') result = await adminService.createQuestion(data);
    else return res.status(400).json({ error: { message: 'Invalid content type', code: 'VALIDATION_ERROR' } });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { message, category } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0)
      return res.status(422).json({ error: { message: 'message is required', code: 'VALIDATION_ERROR' } });
    const validCategories = ['bug', 'suggestion', 'other'];
    const cat = validCategories.includes(category) ? category : 'other';
    await pool.query('INSERT INTO feedback (user_id, message, category) VALUES ($1,$2,$3)', [null, message.trim(), cat]);
    res.status(201).json({ message: 'Feedback received' });
  } catch (err) { next(err); }
};

module.exports = { listUsers, listAnalyses, getAnalytics, listFeedback, createContent, submitFeedback };
