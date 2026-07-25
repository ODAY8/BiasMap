import { api } from './api'

export async function startSession() {
  const data = await api.post('/coach/session', {})
  return data.session_id
}

export async function askCoach(sessionId, message) {
  const data = await api.post('/coach/ask', { session_id: sessionId, message })
  return data.reply
}
