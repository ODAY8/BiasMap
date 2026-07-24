const comparisonService = require('../services/comparison/comparisonService');
const { ANON_USER_ID } = require('../config/constants');

const compare = async (req, res, next) => {
  try {
    const result = await comparisonService.compare(ANON_USER_ID, req.body.articles, req.body.event_description);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const result = await comparisonService.getComparison(req.params.id, ANON_USER_ID);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { compare, getById };
