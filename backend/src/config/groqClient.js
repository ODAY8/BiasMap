const Groq = require('groq-sdk');
const { groq } = require('./env');

const groqClient = new Groq({ apiKey: groq.apiKey });

module.exports = groqClient;
