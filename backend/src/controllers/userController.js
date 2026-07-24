const userModel = require('../models/userModel');

const create = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(422).json({ error: { message: 'email and name required', code: 'VALIDATION_ERROR' } });
    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: { message: 'Email already registered', code: 'CONFLICT' } });
    const user = await userModel.create({ email, name });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { create, getById };
