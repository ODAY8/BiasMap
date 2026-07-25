import { api } from './api'

// XP thresholds per level (simple linear: 500 * level)
function computeLevel(totalXp) {
  const level      = Math.max(1, Math.floor(totalXp / 500) + 1)
  const nextLevelXp = level * 500
  return { level, nextLevelXp }
}

// Backend: GET /api/progress →
//   { progress: { articles_analyzed, techniques_learned, current_streak, longest_streak, last_active_date, weekly_activity },
//     total_xp, badges[], recent_analyses[] }
// UI expects:
//   { articlesAnalyzed, lessonsCompleted, streak, xp, level, nextLevelXp, badges[], weeklyActivity[], skillProgress[] }
export async function getUserProgress() {
  const data = await api.get('/progress')
  const p    = data.progress || {}
  const { level, nextLevelXp } = computeLevel(data.total_xp || 0)

  // weekly_activity is stored as JSONB in DB — may be {} or an array
  const rawActivity = p.weekly_activity
  const weeklyActivity = Array.isArray(rawActivity) ? rawActivity
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day, analyses: 0, lessons: 0,
      }))

  // Map badges from DB shape { name, description, icon, earned_at } to UI shape
  const badges = (data.badges || []).map(b => ({
    id:          b.badge_id ?? b.id,
    name:        b.name,
    description: b.description,
    icon:        b.icon || 'search',
    earnedAt:    b.earned_at,
  }))

  return {
    articlesAnalyzed: p.articles_analyzed  || 0,
    lessonsCompleted: p.techniques_learned  || 0,
    streak:           p.current_streak      || 0,
    longestStreak:    p.longest_streak      || 0,
    xp:               data.total_xp         || 0,
    level,
    nextLevelXp,
    badges,
    weeklyActivity,
    // skillProgress is not tracked in DB — return empty so UI shows nothing
    skillProgress: [],
    recentAnalyses: data.recent_analyses || [],
  }
}
