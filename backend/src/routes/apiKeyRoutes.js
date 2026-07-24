const router = require('express').Router();
const ctrl = require('../controllers/apiKeyController');

// These are open so users can generate their first key
// In production you'd protect /generate with an admin check or a signup flow
router.post('/generate', ctrl.generate);
router.get('/', ctrl.list);
router.delete('/:id', ctrl.revoke);

module.exports = router;
