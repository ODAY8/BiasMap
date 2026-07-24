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

module.exports = { register, login, guestLogin, refreshToken, logout, me };
