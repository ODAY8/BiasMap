const router = require('express').Router();
const ctrl = require('../controllers/comparisonController');
const { aiRoutes } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const v = require('../validators/featureValidators');

router.post('/', aiRoutes, v.compareBody, validate, ctrl.compare);
router.get('/:id', ctrl.getById);

module.exports = router;
