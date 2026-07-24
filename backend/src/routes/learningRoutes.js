const router = require('express').Router();
const ctrl = require('../controllers/learningController');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.get('/topics', ctrl.getTopics);
router.get('/topics/:topicId/lessons', ctrl.getLessons);
router.get('/quizzes/:quizId', ctrl.getQuiz);
router.post('/quizzes/:quizId/submit', [body('answers').isArray()], validate, ctrl.submitQuiz);

module.exports = router;
