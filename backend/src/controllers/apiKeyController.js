const apiKeyModel = require('../models/apiKeyModel');

const generate = async (req, res, next) => {
  try {
    const { user_id, name = 'default' } = req.body;
    if (!user_id) return res.status(422).json({ error: { message: 'user_id required', code: 'VALIDATION_ERROR' } });
    const key = await apiKeyModel.create(user_id, name);
    res.status(201).json({
      key,
      note: 'Store this key securely — it will not be shown again.',
    });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(422).json({ error: { message: 'user_id required', code: 'VALIDATION_ERROR' } });
    res.json(await apiKeyModel.listForUser(user_id));
  } catch (err) { next(err); }
};

const revoke = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(422).json({ error: { message: 'user_id required', code: 'VALIDATION_ERROR' } });
    await apiKeyModel.revoke(req.params.id, user_id);
    res.json({ message: 'API key revoked' });
  } catch (err) { next(err); }
};

module.exports = { generate, list, revoke };
