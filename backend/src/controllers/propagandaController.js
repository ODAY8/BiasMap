const propagandaModel = require('../models/propagandaModel');

const list = async (req, res, next) => {
  try {
    res.json(await propagandaModel.findAll());
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const t = await propagandaModel.findById(req.params.id);
    if (!t) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
    res.json(t);
  } catch (err) { next(err); }
};

module.exports = { list, getById };
