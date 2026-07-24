const apiKeyModel = require('../models/apiKeyModel');

const apiKeyAuth = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: { message: 'Missing X-API-Key header', code: 'UNAUTHORIZED' } });

  const record = await apiKeyModel.findByKey(key).catch(() => null);
  if (!record) return res.status(401).json({ error: { message: 'Invalid API key', code: 'UNAUTHORIZED' } });

  // attach user to request — same shape controllers expect
  req.user = { id: record.uid, email: record.email, name: record.user_name, role: record.role };

  // update last used async — don't block the request
  apiKeyModel.updateLastUsed(record.id).catch(() => {});

  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
  next();
};

module.exports = { apiKeyAuth, requireAdmin };
