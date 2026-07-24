const router = require('express').Router();
const ctrl = require('../controllers/authController');

// Auth is disabled — all routes return 501 Not Implemented.
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/google', ctrl.googleAuth);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.get('/me', ctrl.me);

module.exports = router;
