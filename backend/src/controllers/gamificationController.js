const gamificationService = require('../services/ai/gamificationService');

const todayChallenge = async (req, res, next) => {
  try { res.json(await gamificationService.getTodayChallenge()); } catch (err) { next(err); }
};

const submitChallenge = async (req, res, next) => {
  try {
    const result = await gamificationService.submitChallenge(req.user.id, req.params.id, req.body.answer);
    res.json(result);
  } catch (err) { next(err); }
};

const leaderboard = async (req, res, next) => {
  try { res.json(await gamificationService.getLeaderboard()); } catch (err) { next(err); }
};

module.exports = { todayChallenge, submitChallenge, leaderboard };
