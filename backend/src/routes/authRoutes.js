const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register',
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }), body('name').trim().notEmpty()],
  validate, ctrl.register
);

router.post('/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate, ctrl.login
);

// Guest login — no body required
router.post('/guest', ctrl.guestLogin);

router.post('/refresh',
  [body('refreshToken').notEmpty()],
  validate, ctrl.refreshToken
);

router.post('/logout',
  [body('refreshToken').notEmpty()],
  validate, ctrl.logout
);

router.get('/me', authenticate, ctrl.me);

router.post('/google', ctrl.googleAuth);

router.post('/facebook', ctrl.facebookAuth);

module.exports = router;
