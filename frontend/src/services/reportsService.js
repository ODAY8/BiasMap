import { api } from './api'

export async function getSavedReports() {
  return api.get('/reports')
}

export async function saveReport({ analysisId, title }) {
  return api.post('/reports', { analysis_id: analysisId, title })
}

export async function deleteReport(id) {
  return api.delete(`/reports/${id}`)
}

export async function getShareLink(id) {
  return api.get(`/reports/${id}/share`)
}

export function exportReportPdf(id) {
  const base = import.meta.env.VITE_API_URL || ''
  const token = localStorage.getItem('biasmap_token')
  // Open in new tab — browser handles the PDF download
  window.open(`${base}/api/reports/${id}/export?token=${token}`, '_blank')
}
