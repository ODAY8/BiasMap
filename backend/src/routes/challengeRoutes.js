const router = require('express').Router();
const ctrl = require('../controllers/gamificationController');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.get('/today', ctrl.todayChallenge);
router.post('/:id/submit', [body('answer').notEmpty()], validate, ctrl.submitChallenge);
router.get('/leaderboard', ctrl.leaderboard);

module.exports = router;
