const { verifyAccess } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: { message: 'Missing token', code: 'UNAUTHORIZED' } });
  try {
    req.user = verifyAccess(auth.slice(7));
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired token', code: 'UNAUTHORIZED' } });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
  next();
};

module.exports = { authenticate, requireAdmin };
