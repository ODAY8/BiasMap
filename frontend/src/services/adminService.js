import { api } from './api'

export async function getAdminUsers({ limit = 50, offset = 0 } = {}) {
  return api.get(`/admin/users?limit=${limit}&offset=${offset}`)
}

export async function getAdminAnalytics() {
  return api.get('/admin/analytics')
}

export async function getAdminAnalyses({ limit = 50, offset = 0 } = {}) {
  return api.get(`/admin/reports?limit=${limit}&offset=${offset}`)
}

export async function getAdminFeedback() {
  return api.get('/admin/feedback')
}

export async function submitFeedback({ message, category = 'other' }) {
  return api.post('/feedback', { message, category })
}
