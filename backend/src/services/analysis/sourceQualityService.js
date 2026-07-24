const aiService = require('../../ai/aiService');
const sanitizeHtml = require('sanitize-html');

const detectIndicators = (text) => {
  const clean = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
  return [
    { name: 'byline_present', value: /by\s+[A-Z][a-z]+/i.test(clean) ? 'yes' : 'no' },
    { name: 'date_present', value: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i.test(clean) ? 'yes' : 'no' },
    { name: 'references_present', value: /(according to|cited|source:|reported by|study|research)/i.test(clean) ? 'yes' : 'no' },
    { name: 'headline_style', value: /[!]{2,}|[A-Z]{5,}/.test(clean) ? 'sensational' : 'standard' },
    { name: 'word_count', value: String(clean.split(/\s+/).filter(Boolean).length) },
  ];
};

const analyzeSourceQuality = async (text) => {
  const indicators = detectIndicators(text);
  const aiResult = await aiService.analyzeSourceQuality(indicators);
  return aiResult;
};

module.exports = { analyzeSourceQuality };
