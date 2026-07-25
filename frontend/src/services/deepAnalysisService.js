import { api } from './api'

export async function analyzeViewpoints(text) {
  return api.post('/analyze/viewpoints', { text })
}

export async function analyzeEmotion(text) {
  return api.post('/analyze/emotion', { text })
}

export async function rewriteHeadline(headline) {
  return api.post('/analyze/rewrite-headline', { headline })
}

export async function segmentClaims(text) {
  return api.post('/analyze/segment-claims', { text })
}

export async function verifyClaims(text) {
  return api.post('/analyze/verify-claims', { text })
}

export async function analyzeSourceQuality(text) {
  return api.post('/analyze/source-quality', { text })
}
