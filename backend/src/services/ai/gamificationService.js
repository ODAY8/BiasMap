const gamificationModel = require('../../models/gamificationModel');

const getTodayChallenge = async () => {
  const challenge = await gamificationModel.getTodayChallenge();
  if (!challenge) { const e = new Error('No challenge today'); e.status = 404; throw e; }
  const { correct_answer, ...safe } = challenge;
  return safe;
};

const submitChallenge = async (userId, challengeId, answer) => {
  const challenge = await gamificationModel.getChallengeById(challengeId);
  if (!challenge) { const e = new Error('Challenge not found'); e.status = 404; throw e; }
  const existing = await gamificationModel.getSubmission(userId, challengeId);
  if (existing) { const e = new Error('Already submitted'); e.status = 409; throw e; }

  const correct = JSON.stringify(answer) === JSON.stringify(challenge.correct_answer);
  const xpAwarded = correct ? challenge.xp_reward : 0;
  const submission = await gamificationModel.saveSubmission({ userId, challengeId, answer, xpAwarded });
  if (xpAwarded > 0) await gamificationModel.addXp(userId, xpAwarded);
  return { correct, xp_awarded: xpAwarded, submission_id: submission.id };
};

const getLeaderboard = () => gamificationModel.getLeaderboard(20);

module.exports = { getTodayChallenge, submitChallenge, getLeaderboard };
