const { chatJSON, chatMessages } = require('./groqClient');
const { z } = require('zod');

const analyzePrompt = require('../prompts/analyzePrompt');
const comparePrompt = require('../prompts/comparePrompt');
const viewpointsPrompt = require('../prompts/viewpointsPrompt');
const emotionPrompt = require('../prompts/emotionPrompt');
const rewriteHeadlinePrompt = require('../prompts/rewriteHeadlinePrompt');
const segmentClaimsPrompt = require('../prompts/segmentClaimsPrompt');
const verifyClaimsPrompt = require('../prompts/verifyClaimsPrompt');
const sourceQualityPrompt = require('../prompts/sourceQualityPrompt');
const coachPrompt = require('../prompts/coachPrompt');

// ── Zod schemas ──────────────────────────────────────────────────────────────

const SentenceSchema = z.object({
  sentence_text: z.string(),
  category: z.string(),
  technique: z.string().nullable(),
  explanation: z.string(),
  question: z.string(),
});

const AnalyzeSchema = z.object({
  sentences: z.array(SentenceSchema),
  scores: z.object({
    bias_score: z.number().int().min(0).max(100),
    confidence_score: z.number().int().min(0).max(100),
    emotional_intensity: z.number().int().min(0).max(100),
    perspective_balance: z.number().int().min(0).max(100),
  }),
});

const CompareSchema = z.object({
  articles: z.array(z.object({
    index: z.number(),
    headline_tone: z.string(),
    framing: z.string(),
    political_leaning_description: z.string(),
    emotion_level: z.number(),
    bias_score: z.number(),
    key_omissions: z.array(z.string()),
  })),
  comparison_table: z.array(z.object({ dimension: z.string(), values: z.array(z.string()) })),
  summary: z.string(),
});

const ViewpointsSchema = z.object({
  viewpoints: z.array(z.object({
    category: z.string(),
    present: z.boolean(),
    evidence: z.string().nullable(),
    missing_perspective: z.string().nullable(),
  })),
  summary: z.string(),
});

const EmotionSchema = z.object({
  emotions: z.record(z.object({ score: z.number(), examples: z.array(z.string()) })),
  dominant_emotion: z.string(),
  summary: z.string(),
});

const RewriteSchema = z.object({
  original: z.string(),
  variants: z.record(z.object({ headline: z.string(), explanation: z.string() })),
});

const SegmentSchema = z.object({
  claims: z.array(z.object({ text: z.string(), type: z.string(), explanation: z.string() })),
  summary: z.record(z.number()),
});

const VerifySchema = z.object({
  claims: z.array(z.object({
    claim_text: z.string(),
    verification_guidance: z.array(z.object({ source_type: z.string(), why: z.string(), caution: z.string() })),
  })),
});

const SourceQualitySchema = z.object({
  indicators: z.array(z.object({ name: z.string(), value: z.string(), meaning: z.string(), reader_question: z.string() })),
  overall_guidance: z.string(),
});

// ── Helper ───────────────────────────────────────────────────────────────────

const callAndValidate = async (promptName, systemPrompt, userContent, schema) => {
  try {
    const raw = await chatJSON(promptName, systemPrompt, userContent);
    return schema.parse(raw);
  } catch (err) {
    const e = new Error(`AI response invalid for ${promptName}: ${err.message}`);
    e.status = 502;
    e.code = 'AI_PARSE_ERROR';
    throw e;
  }
};

// ── Public API ───────────────────────────────────────────────────────────────

const analyzeText = (text) =>
  callAndValidate('analyze', analyzePrompt, `Analyze this text:\n\n${text}`, AnalyzeSchema);

const compareArticles = (articles) =>
  callAndValidate(
    'compare',
    comparePrompt,
    articles.map((a, i) => `Article ${i + 1}:\n${a}`).join('\n\n---\n\n'),
    CompareSchema
  );

const analyzeViewpoints = (text) =>
  callAndValidate('viewpoints', viewpointsPrompt, text, ViewpointsSchema);

const analyzeEmotion = (text) =>
  callAndValidate('emotion', emotionPrompt, text, EmotionSchema);

const rewriteHeadline = (headline) =>
  callAndValidate('rewrite_headline', rewriteHeadlinePrompt, headline, RewriteSchema);

const segmentClaims = (text) =>
  callAndValidate('segment_claims', segmentClaimsPrompt, text, SegmentSchema);

const verifyClaims = (text) =>
  callAndValidate('verify_claims', verifyClaimsPrompt, text, VerifySchema);

const analyzeSourceQuality = (indicators) =>
  callAndValidate(
    'source_quality',
    sourceQualityPrompt,
    `Indicators:\n${JSON.stringify(indicators, null, 2)}`,
    SourceQualitySchema
  );

const coachReply = async (messages) => {
  const fullMessages = [{ role: 'system', content: coachPrompt }, ...messages];
  return chatMessages('coach', fullMessages);
};

module.exports = {
  analyzeText,
  compareArticles,
  analyzeViewpoints,
  analyzeEmotion,
  rewriteHeadline,
  segmentClaims,
  verifyClaims,
  analyzeSourceQuality,
  coachReply,
};
