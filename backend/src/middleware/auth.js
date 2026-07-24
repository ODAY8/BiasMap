const { verifyAccess } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ error: { message: 'Missing or invalid token', code: 'UNAUTHORIZED' } });
  try {
    req.user = verifyAccess(auth.slice(7));
    next();
  } catch {
    res.status(401).json({ error: { message: 'Token expired or invalid', code: 'UNAUTHORIZED' } });
  }
};

module.exports = { authenticate };
