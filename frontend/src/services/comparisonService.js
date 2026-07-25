import { api } from './api'

// Backend returns: { id, articles[{ index, headline_tone, framing, political_leaning_description, emotion_level, bias_score, key_omissions[] }], comparison_table[], summary }
// UI expects:      { comparison[{ title, framing, tone, emotion{}, stakeholders[], summary }] }
function mapCompareResponse(data) {
  const articles = data.articles || []
  const labels   = ['Source A', 'Source B', 'Source C', 'Source D', 'Source E']

  const comparison = articles.map((a, i) => ({
    title:        labels[i] || `Source ${i + 1}`,
    framing:      a.framing || a.political_leaning_description || '—',
    tone:         a.headline_tone || '—',
    emotion:      {
      neutral:  Math.max(0, 100 - (a.emotion_level || 0)),
      urgency:  Math.round((a.emotion_level || 0) * 0.4),
      fear:     Math.round((a.emotion_level || 0) * 0.3),
      anger:    Math.round((a.emotion_level || 0) * 0.2),
      hope:     Math.round((a.emotion_level || 0) * 0.1),
    },
    stakeholders: a.key_omissions?.slice(0, 3) || [],
    summary:      a.political_leaning_description || '—',
    biasScore:    a.bias_score ?? 0,
    keyOmissions: a.key_omissions || [],
  }))

  return {
    id:               data.id,
    comparison,
    comparison_table: data.comparison_table || [],
    summary:          data.summary || '',
  }
}

export async function compareArticles(articles, eventDescription = '') {
  const data = await api.post('/compare', { articles, event_description: eventDescription })
  return mapCompareResponse(data)
}
