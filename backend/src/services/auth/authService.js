const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { google: googleCfg, facebook: facebookCfg } = require('../../config/env');
const userModel = require('../../models/userModel');
const refreshTokenModel = require('../../models/refreshTokenModel');
const { signAccess, signRefresh, verifyRefresh } = require('../../utils/jwt');

const googleClient = new OAuth2Client(googleCfg.clientId);

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

// Find-or-create helper for OAuth
const findOrCreateOAuthUser = async ({ email, name, googleId, facebookId }) => {
  // 1. Try find by provider ID
  let user = googleId
    ? await userModel.findByGoogleId(googleId)
    : await userModel.findByFacebookId(facebookId);

  // 2. Try find by email and link provider
  if (!user && email) {
    user = await userModel.findByEmail(email);
    if (user) await userModel.updateOAuth(user.id, { googleId, facebookId });
  }

  // 3. Create new user
  if (!user) {
    user = await userModel.create({ email, name, isGuest: false, googleId, facebookId });
  }

  return issueTokens(user);
};

const googleLogin = async (accessToken) => {
  const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) { const e = new Error('Invalid Google token'); e.status = 401; throw e; }
  const { sub: googleId, email, name } = await res.json();
  return findOrCreateOAuthUser({ email, name, googleId });
};

const facebookLogin = async (accessToken) => {
  const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
  const res = await fetch(url);
  if (!res.ok) { const e = new Error('Invalid Facebook token'); e.status = 401; throw e; }
  const { id: facebookId, name, email } = await res.json();
  return findOrCreateOAuthUser({ email, name, facebookId });
};

module.exports = { register, login, guestLogin, refresh, logout, googleLogin, facebookLogin };
