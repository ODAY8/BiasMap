const authService = require('../services/auth/authService');
const userModel = require('../models/userModel');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

const guestLogin = async (req, res, next) => {
  try {
    const result = await authService.guestLogin();
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
    res.json(user);
  } catch (err) { next(err); }
};

const googleAuth = async (req, res, next) => {
  try {
    console.log('[Google Auth] body keys:', Object.keys(req.body), '| accessToken length:', req.body.accessToken?.length)
    const token = req.body.accessToken || req.body.idToken || req.body.token
    if (!token) { return res.status(400).json({ error: { message: 'Missing accessToken', code: 'VALIDATION_ERROR' } }) }
    const result = await authService.googleLogin(token);
    res.json(result);
  } catch (err) { next(err); }
};

const facebookAuth = async (req, res, next) => {
  try {
    const token = req.body.accessToken || req.body.token
    if (!token) { return res.status(400).json({ error: { message: 'Missing accessToken', code: 'VALIDATION_ERROR' } }) }
    const result = await authService.facebookLogin(token);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { register, login, guestLogin, refreshToken, logout, me, googleAuth, facebookAuth };
