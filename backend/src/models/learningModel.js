const pool = require('../config/db');

const getTopics = () =>
  pool.query('SELECT * FROM learning_topics ORDER BY order_index').then(r => r.rows);

const getLessons = (topicId) =>
  pool.query('SELECT * FROM learning_lessons WHERE topic_id = $1 ORDER BY order_index', [topicId])
    .then(r => r.rows);

const getLesson = (id) =>
  pool.query('SELECT * FROM learning_lessons WHERE id = $1', [id]).then(r => r.rows[0]);

const getQuiz = (id) =>
  pool.query('SELECT * FROM quizzes WHERE id = $1', [id]).then(r => r.rows[0]);

const getQuizQuestions = (quizId) =>
  pool.query('SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index', [quizId])
    .then(r => r.rows);

const saveAttempt = ({ userId, quizId, score, total, answers }) =>
  pool.query(
    'INSERT INTO quiz_attempts (user_id, quiz_id, score, total, answers) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [userId, quizId, score, total, JSON.stringify(answers)]
  ).then(r => r.rows[0]);

// Admin CRUD
const createTopic = ({ title, description, order_index }) =>
  pool.query('INSERT INTO learning_topics (title, description, order_index) VALUES ($1,$2,$3) RETURNING *',
    [title, description, order_index]).then(r => r.rows[0]);

const createLesson = ({ topicId, title, content, order_index }) =>
  pool.query('INSERT INTO learning_lessons (topic_id, title, content, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
    [topicId, title, content, order_index]).then(r => r.rows[0]);

const createQuiz = ({ lessonId, title }) =>
  pool.query('INSERT INTO quizzes (lesson_id, title) VALUES ($1,$2) RETURNING *',
    [lessonId, title]).then(r => r.rows[0]);

const createQuestion = ({ quizId, question, options, correct_index, explanation, order_index }) =>
  pool.query(
    'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [quizId, question, JSON.stringify(options), correct_index, explanation, order_index]
  ).then(r => r.rows[0]);

module.exports = { getTopics, getLessons, getLesson, getQuiz, getQuizQuestions, saveAttempt, createTopic, createLesson, createQuiz, createQuestion };
