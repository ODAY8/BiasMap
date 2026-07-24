const router = require('express').Router();
const ctrl = require('../controllers/analyzeController');
const { aiRoutes } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const v = require('../validators/featureValidators');

router.get('/', ctrl.list);
router.post('/', aiRoutes, v.analyzeBody, validate, ctrl.analyze);
router.get('/:id', ctrl.getById);
router.get('/:id/replay', ctrl.replay);
router.post('/viewpoints', aiRoutes, v.textBody, validate, ctrl.viewpoints);
router.post('/emotion', aiRoutes, v.textBody, validate, ctrl.emotion);
router.post('/rewrite-headline', aiRoutes, v.headlineBody, validate, ctrl.rewriteHeadline);
router.post('/segment-claims', aiRoutes, v.textBody, validate, ctrl.segmentClaims);
router.post('/verify-claims', aiRoutes, v.textBody, validate, ctrl.verifyClaims);
router.post('/source-quality', aiRoutes, v.textBody, validate, ctrl.sourceQuality);

module.exports = router;
