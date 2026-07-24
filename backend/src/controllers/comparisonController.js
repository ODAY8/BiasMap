const comparisonService = require('../services/comparison/comparisonService');

const compare = async (req, res, next) => {
  try {
    const result = await comparisonService.compare(req.user.id, req.body.articles, req.body.event_description);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const result = await comparisonService.getComparison(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { compare, getById };
