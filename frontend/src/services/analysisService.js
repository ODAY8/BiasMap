import { api } from './api'

const CATEGORY_TYPE = {
  loaded_language: 'Loaded Language',
  propaganda:      'Loaded Language',
  fear:            'Emotion',
  opinion:         'Framing Bias',
  speculation:     'Vague Attribution',
}

function mapAnalysisResponse(data) {
  const sentences = data.sentences || []
  const scores    = data.scores    || {}

  const highlights = sentences
    .filter(s => s.category !== 'fact' && s.category !== 'neutral')
    .map(s => ({
      sentence:    s.sentence_text,
      type:        CATEGORY_TYPE[s.category] || 'Framing Bias',
      explanation: s.explanation,
      impact:      s.question,
    }))

  return {
    id:                  data.id,
    summary:             `Analyzed ${sentences.length} sentences.`,
    biasScore:           scores.bias_score           ?? 0,
    scores: {
      bias_score:          scores.bias_score          ?? 0,
      confidence_score:    scores.confidence_score    ?? 0,
      emotional_intensity: scores.emotional_intensity ?? 0,
      perspective_balance: scores.perspective_balance ?? 0,
    },
    highlights,
    reflectionQuestions: sentences.filter(s => s.question).slice(0, 4).map(s => s.question),
    sentences,
  }
}

const SOURCE_TYPE_MAP = {
  news: 'article', opinion: 'article', social: 'social',
  academic: 'article', article: 'article', speech: 'speech',
  blog: 'blog', caption: 'caption',
}

const GUEST_ANALYSES_KEY = 'biasmap_guest_analyses'

function getGuestAnalyses() {
  try { return JSON.parse(localStorage.getItem(GUEST_ANALYSES_KEY) || '[]') } catch { return [] }
}

function saveGuestAnalysis(result) {
  const list = getGuestAnalyses()
  list.unshift({ ...result, created_at: new Date().toISOString(), source_type: 'article' })
  localStorage.setItem(GUEST_ANALYSES_KEY, JSON.stringify(list.slice(0, 20)))
}

function isGuest() {
  try {
    const u = JSON.parse(localStorage.getItem('biasmap_user') || 'null')
    return u?.is_guest === true
  } catch { return false }
}

export async function analyzeContent({ text, contentType }) {
  const source_type = SOURCE_TYPE_MAP[contentType] || 'article'
  const result = mapAnalysisResponse(await api.post('/analyze', { text, source_type }))
  if (isGuest()) saveGuestAnalysis(result)
  return result
}

export async function getRecentAnalyses() {
  if (isGuest()) {
    return getGuestAnalyses().map(r => ({
      id:          r.id || crypto.randomUUID(),
      title:       'Analysis',
      date:        r.created_at,
      preview:     `Bias: ${r.scores?.bias_score ?? '—'} · Emotional intensity: ${r.scores?.emotional_intensity ?? '—'}`,
      contentType: 'Article',
      biasScore:   r.biasScore ?? 0,
    }))
  }
  const rows = await api.get('/analyze')
  return rows.map(r => ({
    id:          r.id,
    title:       `${r.source_type.charAt(0).toUpperCase() + r.source_type.slice(1)} analysis`,
    date:        r.created_at,
    preview:     `Bias: ${r.scores?.bias_score ?? '—'} · Emotional intensity: ${r.scores?.emotional_intensity ?? '—'}`,
    contentType: r.source_type === 'article' ? 'News'
               : r.source_type.charAt(0).toUpperCase() + r.source_type.slice(1),
    biasScore:   r.scores?.bias_score ?? 0,
  }))
}

export function exportAnalysis(reportId) {
  if (!reportId || reportId === 'latest') return
  const base = import.meta.env.VITE_API_URL || ''
  window.open(`${base}/api/reports/${reportId}/export`, '_blank')
}
