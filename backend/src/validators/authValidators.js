const { body } = require('express-validator');

const register = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const googleAuth = [
  body('idToken').notEmpty().withMessage('Google ID token required'),
];

const forgotPassword = [
  body('email').isEmail().normalizeEmail(),
];

const resetPassword = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
];

module.exports = { register, login, googleAuth, forgotPassword, resetPassword };
