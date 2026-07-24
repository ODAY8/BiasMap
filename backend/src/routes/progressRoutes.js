const router = require('express').Router();
const ctrl = require('../controllers/progressController');

router.get('/', ctrl.getDashboard);

module.exports = router;
