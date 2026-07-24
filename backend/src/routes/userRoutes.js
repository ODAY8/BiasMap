const router = require('express').Router();
const ctrl = require('../controllers/userController');

router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);

module.exports = router;
