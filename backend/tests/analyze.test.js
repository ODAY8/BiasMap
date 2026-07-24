const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

jest.mock('../src/config/groqClient', () => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              sentences: [{
                sentence_text: 'Politicians are destroying our country.',
                category: 'fear',
                technique: 'Appeal to Fear',
                explanation: 'Uses sweeping negative language to evoke fear without specific evidence.',
                question: 'What specific evidence supports this claim?',
              }],
              scores: {
                bias_score: 75,
                confidence_score: 80,
                emotional_intensity: 85,
                perspective_balance: 20,
              },
            }),
          },
        }],
      }),
    },
  },
}));

afterAll(async () => { await pool.end(); });

describe('POST /api/analyze', () => {
  it('returns analysis with sentences and scores', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: 'Politicians are destroying our country.', source_type: 'article' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('sentences');
    expect(res.body.sentences[0].category).toBe('fear');
    expect(res.body.scores.bias_score).toBe(75);
  });

  it('returns 422 for invalid source_type', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: 'Some text here to analyze.', source_type: 'invalid' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for text too short', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: 'short', source_type: 'article' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/analyze/:id/replay', () => {
  it('returns stored sentences for a valid analysis', async () => {
    const createRes = await request(app)
      .post('/api/analyze')
      .send({ text: 'Politicians are destroying our country.', source_type: 'article' });
    const replayRes = await request(app).get(`/api/analyze/${createRes.body.id}/replay`);
    expect(replayRes.status).toBe(200);
    expect(replayRes.body).toHaveProperty('sentences');
    expect(replayRes.body.sentences[0]).toHaveProperty('order_index');
  });
});

describe('GET /api/propaganda-techniques', () => {
  it('returns the seeded techniques list', async () => {
    const res = await request(app).get('/api/propaganda-techniques');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
