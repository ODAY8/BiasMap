const coachService = require('../services/ai/coachService');

const newSession = async (req, res, next) => {
  try {
    const session = await coachService.startSession(req.user.id);
    res.status(201).json({ session_id: session.id });
  } catch (err) { next(err); }
};

const ask = async (req, res, next) => {
  try {
    const result = await coachService.ask(req.user.id, req.body.session_id, req.body.message);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { newSession, ask };
