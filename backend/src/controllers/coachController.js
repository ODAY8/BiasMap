const coachService = require('../services/ai/coachService');
const { ANON_USER_ID } = require('../config/constants');

const newSession = async (req, res, next) => {
  try {
    const session = await coachService.startSession(ANON_USER_ID);
    res.status(201).json({ session_id: session.id });
  } catch (err) { next(err); }
};

const ask = async (req, res, next) => {
  try {
    const result = await coachService.ask(ANON_USER_ID, req.body.session_id, req.body.message);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { newSession, ask };
