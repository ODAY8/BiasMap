const pool = require('../../config/db');
const userModel = require('../../models/userModel');
const learningModel = require('../../models/learningModel');

const listUsers = ({ limit, offset }) => userModel.listAll({ limit, offset });
const countUsers = () => userModel.countAll();

const getAnalytics = async () => {
  const [users, analyses, quizAttempts] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users').then(r => parseInt(r.rows[0].count, 10)),
    pool.query('SELECT COUNT(*) FROM analyses').then(r => parseInt(r.rows[0].count, 10)),
    pool.query('SELECT COUNT(*) FROM quiz_attempts').then(r => parseInt(r.rows[0].count, 10)),
  ]);
  return { total_users: users, total_analyses: analyses, total_quiz_attempts: quizAttempts };
};

const listFeedback = ({ limit = 50, offset = 0 }) =>
  pool.query('SELECT * FROM feedback ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
    .then(r => r.rows);

const createTopic = (data) => learningModel.createTopic(data);
const createLesson = (data) => learningModel.createLesson(data);
const createQuiz = (data) => learningModel.createQuiz(data);
const createQuestion = (data) => learningModel.createQuestion(data);

const listAnalyses = ({ limit = 50, offset = 0 }) =>
  pool.query('SELECT id, user_id, source_type, scores, created_at FROM analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
    .then(r => r.rows);

module.exports = { listUsers, countUsers, getAnalytics, listFeedback, createTopic, createLesson, createQuiz, createQuestion, listAnalyses };
