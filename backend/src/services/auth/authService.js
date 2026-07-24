const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../../models/userModel');
const refreshTokenModel = require('../../models/refreshTokenModel');
const { signAccess, signRefresh, verifyRefresh } = require('../../utils/jwt');

const issueTokens = async (user) => {
  const accessToken = signAccess({ id: user.id, email: user.email, name: user.name, role: user.role, is_guest: user.is_guest });
  const refreshToken = signRefresh({ id: user.id });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await refreshTokenModel.save(user.id, refreshToken, expiresAt);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, is_guest: user.is_guest } };
};

const register = async ({ email, password, name }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) { const e = new Error('Email already registered'); e.status = 409; throw e; }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.create({ email, passwordHash, name, isGuest: false });
  return issueTokens(user);
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user || !user.password_hash) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
  return issueTokens(user);
};

const guestLogin = async () => {
  // Create a unique guest user with a generated name — no email or password needed
  const guestName = `Guest_${crypto.randomBytes(4).toString('hex')}`;
  const user = await userModel.create({ email: null, passwordHash: null, name: guestName, isGuest: true });
  return issueTokens(user);
};

const refresh = async (token) => {
  let payload;
  try { payload = verifyRefresh(token); } catch { const e = new Error('Invalid refresh token'); e.status = 401; throw e; }
  const stored = await refreshTokenModel.find(token);
  if (!stored) { const e = new Error('Refresh token revoked or expired'); e.status = 401; throw e; }
  await refreshTokenModel.revoke(token);
  const user = await userModel.findById(payload.id);
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }
  return issueTokens(user);
};

const logout = (token) => refreshTokenModel.revoke(token);

module.exports = { register, login, guestLogin, refresh, logout };
