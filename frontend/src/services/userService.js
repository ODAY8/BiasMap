import { api } from './api'
import { getUserProgress } from './progressService'

export async function getUserProfile() {
  const [me, progress] = await Promise.all([
    api.get('/auth/me'),
    getUserProgress(),
  ])
  return {
    name:             me.name,
    email:            me.email || '',
    joinedAt:         me.created_at,
    isGuest:          me.is_guest,
    articlesAnalyzed: progress.articlesAnalyzed,
    lessonsCompleted: progress.lessonsCompleted,
    streak:           progress.streak,
    longestStreak:    progress.longestStreak,
    badges:           progress.badges,
    skillProgress:    progress.skillProgress,
    xp:               progress.xp,
    level:            progress.level,
    nextLevelXp:      progress.nextLevelXp,
    weeklyActivity:   progress.weeklyActivity,
  }
}


