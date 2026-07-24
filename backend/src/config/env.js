require('dotenv').config();

const required = ['DATABASE_URL', 'GROQ_API_KEY', 'GROQ_MODEL'];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: { url: process.env.DATABASE_URL },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};