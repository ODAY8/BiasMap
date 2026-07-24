const { body } = require('express-validator');

const SOURCE_TYPES = ['article', 'social', 'speech', 'blog', 'caption'];

const analyzeBody = [
  body('text').trim().isLength({ min: 10, max: 50000 }).withMessage('text must be 10–50000 chars'),
  body('source_type').isIn(SOURCE_TYPES).withMessage(`source_type must be one of: ${SOURCE_TYPES.join(', ')}`),
];

const textBody = [
  body('text').trim().isLength({ min: 10, max: 50000 }),
];

const headlineBody = [
  body('headline').trim().isLength({ min: 3, max: 500 }),
];

const compareBody = [
  body('articles').isArray({ min: 2, max: 5 }).withMessage('articles must be an array of 2–5 items'),
  body('articles.*').isString().isLength({ min: 10, max: 50000 }),
];

const coachAsk = [
  body('session_id').isUUID(),
  body('message').trim().isLength({ min: 1, max: 2000 }),
];

const quizSubmit = [
  body('answers').isArray().withMessage('answers must be an array of selected option indices'),
];

module.exports = { analyzeBody, textBody, headlineBody, compareBody, coachAsk, quizSubmit };
