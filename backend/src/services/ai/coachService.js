const aiService = require('../../ai/aiService');
const coachModel = require('../../models/coachModel');

const startSession = (userId) => coachModel.createSession(userId);

const ask = async (userId, sessionId, message) => {
  const session = await coachModel.findSession(sessionId);
  if (!session) { const e = new Error('Session not found'); e.status = 404; throw e; }
  if (session.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  await coachModel.addMessage(sessionId, 'user', message);
  const history = await coachModel.getMessages(sessionId, 20);
  const reply = await aiService.coachReply(history);
  await coachModel.addMessage(sessionId, 'assistant', reply);
  return { reply };
};

module.exports = { startSession, ask };
