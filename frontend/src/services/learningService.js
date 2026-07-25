import { api } from './api'

// Backend: GET /api/learning/topics → [{ id, title, description, order_index }]
// UI expects: [{ id, title, description, difficulty, duration, completed, xp }]
// difficulty/duration/xp/completed are not in the DB — we derive sensible defaults
const DIFFICULTY_BY_ORDER = ['Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced']

function mapTopic(t, index) {
  return {
    id:          t.id,
    title:       t.title,
    description: t.description || '',
    difficulty:  DIFFICULTY_BY_ORDER[index] || 'Intermediate',
    duration:    12 + index * 3,
    xp:          150 + index * 50,
    completed:   false,
    order_index: t.order_index,
  }
}

export async function getLearningModules() {
  const topics = await api.get('/learning/topics')
  return topics.map(mapTopic)
}

// Backend: GET /api/learning/topics/:topicId/lessons → [{ id, topic_id, title, content, order_index }]
// UI LessonDetail expects: { id, title, description, difficulty, duration, xp, objectives[], sections[], examples[], quiz[] }
export async function getLessonById(topicId) {
  const [topics, lessons] = await Promise.all([
    api.get('/learning/topics'),
    api.get(`/learning/topics/${topicId}/lessons`),
  ])

  const topicIndex = topics.findIndex(t => String(t.id) === String(topicId))
  const topic      = topics[topicIndex] || {}
  const firstLesson = lessons[0] || {}

  return {
    id:          topicId,
    title:       topic.title || firstLesson.title || 'Lesson',
    description: topic.description || '',
    difficulty:  DIFFICULTY_BY_ORDER[topicIndex] || 'Intermediate',
    duration:    12 + topicIndex * 3,
    xp:          150 + topicIndex * 50,
    objectives: [
      'Identify this technique in real news articles',
      'Understand the psychological mechanism behind it',
      'Apply critical questions to evaluate content',
      'Recognize subtle variations of the technique',
    ],
    sections: lessons.map(l => ({
      title:   l.title,
      content: l.content,
    })),
    examples: [
      { biased: 'Protesters clash with police', neutral: 'Police use force on protesters' },
      { biased: 'Government forced to act', neutral: 'Government announces policy' },
    ],
    quiz: [],
  }
}

// Backend: POST /api/learning/quizzes/:quizId/submit { answers: [0, 1, 2] }
export async function submitQuiz(quizId, answers) {
  return api.post(`/learning/quizzes/${quizId}/submit`, { answers })
}
