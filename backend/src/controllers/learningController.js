const learningService = require('../services/learning/learningService');
const { ANON_USER_ID } = require('../config/constants');

const getTopics = async (req, res, next) => {
  try { res.json(await learningService.getTopics()); } catch (err) { next(err); }
};

const getLessons = async (req, res, next) => {
  try { res.json(await learningService.getLessons(req.params.topicId)); } catch (err) { next(err); }
};

const getQuiz = async (req, res, next) => {
  try { res.json(await learningService.getQuizWithQuestions(req.params.quizId)); } catch (err) { next(err); }
};

const submitQuiz = async (req, res, next) => {
  try {
    const result = await learningService.submitQuiz(ANON_USER_ID, req.params.quizId, req.body.answers);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getTopics, getLessons, getQuiz, submitQuiz };
