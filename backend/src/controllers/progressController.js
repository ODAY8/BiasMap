const progressService = require('../services/dashboard/progressService');
const { ANON_USER_ID } = require('../config/constants');

const getDashboard = async (req, res, next) => {
  try { res.json(await progressService.getDashboard(ANON_USER_ID)); } catch (err) { next(err); }
};

module.exports = { getDashboard };
