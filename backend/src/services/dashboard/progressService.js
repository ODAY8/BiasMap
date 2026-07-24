const pool = require('../../config/db');
const progressModel = require('../../models/progressModel');
const gamificationModel = require('../../models/gamificationModel');
const analysisModel = require('../../models/analysisModel');

const updateStreak = async (userId) => {
  const row = await progressModel.get(userId);
  const today = new Date().toISOString().slice(0, 10);
  const last = row?.last_active_date ? String(row.last_active_date).slice(0, 10) : null;
  if (last === today) return; // already active today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = last === yesterday ? (row.current_streak || 0) + 1 : 1;
  const longest = Math.max(newStreak, row?.longest_streak || 0);
  await pool.query(
    `INSERT INTO user_progress (user_id, current_streak, longest_streak, last_active_date)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_streak = $2, longest_streak = $3, last_active_date = $4, updated_at = NOW()`,
    [userId, newStreak, longest, today]
  );
};

const getDashboard = async (userId) => {
  const [progress, badges, recentAnalyses] = await Promise.all([
    progressModel.get(userId),
    gamificationModel.getUserBadges(userId),
    analysisModel.listForUser(userId, { limit: 5 }),
  ]);
  const xpRow = await pool
    .query('SELECT total_xp FROM user_xp WHERE user_id = $1', [userId])
    .then(r => r.rows[0]);

  return {
    progress: progress || {},
    total_xp: xpRow?.total_xp || 0,
    badges,
    recent_analyses: recentAnalyses,
  };
};

module.exports = { getDashboard, updateStreak };
