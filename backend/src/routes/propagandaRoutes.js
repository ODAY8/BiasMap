const router = require('express').Router();
const ctrl = require('../controllers/propagandaController');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

module.exports = router;
