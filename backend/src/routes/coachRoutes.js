const router = require('express').Router();
const ctrl = require('../controllers/coachController');
const { aiRoutes } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const v = require('../validators/featureValidators');

router.post('/session', ctrl.newSession);
router.post('/ask', aiRoutes, v.coachAsk, validate, ctrl.ask);

module.exports = router;
