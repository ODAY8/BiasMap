const groqClient = require('../config/groqClient');
const { groq } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Call Groq chat completion and return parsed JSON.
 * @param {string} promptName - label for logging
 * @param {string} systemPrompt
 * @param {string} userContent
 * @returns {Promise<object>} parsed JSON from model
 */
const chatJSON = async (promptName, systemPrompt, userContent) => {
  const start = Date.now();
  const completion = await groqClient.chat.completions.create({
    model: groq.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const latency = Date.now() - start;
  logger.info('groq_call', { prompt: promptName, latency_ms: latency, model: groq.model });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from AI');
  return JSON.parse(raw);
};

/**
 * Multi-turn chat (for coach) — accepts messages array.
 */
const chatMessages = async (promptName, messages) => {
  const start = Date.now();
  const completion = await groqClient.chat.completions.create({
    model: groq.model,
    messages,
    temperature: 0.5,
  });
  const latency = Date.now() - start;
  logger.info('groq_call', { prompt: promptName, latency_ms: latency });
  return completion.choices[0]?.message?.content ?? '';
};

module.exports = { chatJSON, chatMessages };
