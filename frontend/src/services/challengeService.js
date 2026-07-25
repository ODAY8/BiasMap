import { api } from './api'

// Backend challenge schema: { id, title, description, source_text, xp_reward, active_date }
// correct_answer is stripped server-side — it's a single JSONB object e.g. { technique: "Appeal to Fear" }
// The UI multi-question model is adapted: we present the challenge as one question asking for the technique.
// All techniques seeded in the DB — options must match correct_answer values exactly
const TECHNIQUE_OPTIONS = [
  'Appeal to Fear',
  'Bandwagon',
  'Name Calling',
  'False Dilemma',
  'Ad Hominem',
  'Cherry Picking',
  'Glittering Generalities',
  'Transfer',
  'Plain Folks',
  'Card Stacking',
  'Repetition',
  'Scapegoating',
]

function mapChallenge(data) {
  return {
    id:          data.id,
    title:       data.title,
    description: data.description,
    article:     data.source_text,
    xp_reward:   data.xp_reward,
    questions: [
      {
        id:          'q1',
        text:        'What is the primary propaganda or bias technique used in this excerpt?',
        options:     TECHNIQUE_OPTIONS,
        correct:     null, // unknown until submit
        explanation: 'Submit your answer to see if you were correct.',
      },
    ],
  }
}

export async function getDailyChallenge() {
  try {
    const data = await api.get('/challenges/today')
    return mapChallenge(data)
  } catch (err) {
    // 404 means no challenge seeded for today
    if (err.status === 404) {
      const e = new Error('No challenge available for today. Check back tomorrow!')
      e.status = 404
      throw e
    }
    throw err
  }
}

// answer: the selected option string — backend expects { technique: "..." }
export async function submitChallenge(challengeId, answer) {
  const data = await api.post(`/challenges/${challengeId}/submit`, { answer: { technique: answer } })
  return {
    correct:       data.correct,
    xp:            data.xp_awarded,
    badgeEarned:   null,
    score:         data.correct ? 100 : 0,
    correctCount:  data.correct ? 1 : 0,
    totalCount:    1,
    // Pass back the selected answer so the UI can show which was correct
    selectedAnswer: answer,
  }
}

export async function getLeaderboard() {
  return api.get('/challenges/leaderboard')
}
