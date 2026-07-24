const progressService = require('../services/dashboard/progressService');

const getDashboard = async (req, res, next) => {
  try {
    res.json(await progressService.getDashboard(req.user.id));
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
