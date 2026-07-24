// Auth is disabled — all endpoints return 501 Not Implemented.

const disabled = (req, res) =>
  res.status(501).json({ error: { message: 'Authentication is not enabled on this platform', code: 'NOT_IMPLEMENTED' } });

module.exports = {
  register: disabled,
  login: disabled,
  googleAuth: disabled,
  refreshToken: disabled,
  logout: disabled,
  forgotPassword: disabled,
  resetPassword: disabled,
  me: disabled,
};
