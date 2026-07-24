const router = require('express').Router();
const ctrl = require('../controllers/reportsController');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.get('/', ctrl.list);
router.post('/', [body('title').trim().notEmpty()], validate, ctrl.create);
router.delete('/:id', ctrl.remove);
router.get('/:id/export', ctrl.exportPdf);
router.get('/:id/share', ctrl.shareLink);

module.exports = router;
