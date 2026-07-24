const pool = require('../config/db');

const getTodayChallenge = () =>
  pool.query("SELECT * FROM challenges WHERE active_date = CURRENT_DATE").then(r => r.rows[0]);

const getChallengeById = (id) =>
  pool.query('SELECT * FROM challenges WHERE id = $1', [id]).then(r => r.rows[0]);

const getSubmission = (userId, challengeId) =>
  pool.query('SELECT * FROM challenge_submissions WHERE user_id = $1 AND challenge_id = $2', [userId, challengeId])
    .then(r => r.rows[0]);

const saveSubmission = ({ userId, challengeId, answer, xpAwarded }) =>
  pool.query(
    'INSERT INTO challenge_submissions (user_id, challenge_id, answer, xp_awarded) VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, challengeId, JSON.stringify(answer), xpAwarded]
  ).then(r => r.rows[0]);

const addXp = (userId, xp) =>
  pool.query(
    `INSERT INTO user_xp (user_id, total_xp) VALUES ($1,$2)
     ON CONFLICT (user_id) DO UPDATE SET total_xp = user_xp.total_xp + $2, updated_at = NOW()`,
    [userId, xp]
  );

const getLeaderboard = (limit = 20) =>
  pool.query('SELECT id, name, total_xp, rank FROM leaderboard LIMIT $1', [limit]).then(r => r.rows);

const getUserBadges = (userId) =>
  pool.query(
    'SELECT b.*, ub.earned_at FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1',
    [userId]
  ).then(r => r.rows);

const awardBadge = (userId, badgeId) =>
  pool.query(
    'INSERT INTO user_badges (user_id, badge_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [userId, badgeId]
  );

module.exports = { getTodayChallenge, getChallengeById, getSubmission, saveSubmission, addXp, getLeaderboard, getUserBadges, awardBadge };
