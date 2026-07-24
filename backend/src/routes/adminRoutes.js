const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.get('/users', ctrl.listUsers);
router.get('/reports', ctrl.listAnalyses);
router.get('/analytics', ctrl.getAnalytics);
router.get('/feedback', ctrl.listFeedback);
router.post('/content', [body('type').notEmpty()], validate, ctrl.createContent);

module.exports = router;
