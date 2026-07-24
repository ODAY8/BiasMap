// Auth is disabled — this platform runs without login.
// These stubs exist so authController can still import this module without crashing.

const notEnabled = () => {
  const e = new Error('Authentication is not enabled on this platform');
  e.status = 501;
  throw e;
};

module.exports = {
  register: notEnabled,
  login: notEnabled,
  googleLogin: notEnabled,
  refresh: notEnabled,
  logout: notEnabled,
  forgotPassword: notEnabled,
  resetPassword: notEnabled,
};
