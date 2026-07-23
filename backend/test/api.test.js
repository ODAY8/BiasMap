const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createDatabase } = require('../src/db/database');

function setup() {
  const db = createDatabase({ dbPath: ':memory:' });
  return { app: createApp({ db }), db };
}

test('health endpoint reports service status', async () => {
  const { app, db } = setup();
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  db.close();
});

test('categories and sources support CRUD', async () => {
  const { app, db } = setup();
  const category = await request(app).post('/api/categories').send({ name: 'Media', color: '#123456' });
  assert.equal(category.status, 201);
  assert.equal(category.body.data.name, 'Media');
  const source = await request(app).post('/api/sources').send({ name: 'Example', url: 'https://example.test/news' });
  assert.equal(source.status, 201);
  const updated = await request(app).patch(`/api/categories/${category.body.data.id}`).send({ description: 'News' });
  assert.equal(updated.status, 200);
  const list = await request(app).get('/api/categories?limit=1');
  assert.equal(list.status, 200);
  assert.equal(list.body.pagination.total, 1);
  assert.equal((await request(app).delete(`/api/sources/${source.body.data.id}`)).status, 204);
  db.close();
});

test('reports and markers can be created, searched, and summarized', async () => {
  const { app, db } = setup();
  const category = await request(app).post('/api/categories').send({ name: 'Workplace' });
  const report = await request(app).post('/api/reports').send({
    title: 'Hiring disparity', description: 'Example report', category_id: category.body.data.id,
    latitude: 51.5, longitude: -0.1, severity: 4
  });
  assert.equal(report.status, 201);
  assert.equal(report.body.data.category_name, 'Workplace');
  const marker = await request(app).post('/api/markers').send({
    title: 'Hiring marker', report_id: report.body.data.id, category_id: category.body.data.id,
    latitude: 51.5, longitude: -0.1, severity: 4
  });
  assert.equal(marker.status, 201);
  const search = await request(app).get('/api/reports?q=disparity&minLat=50&maxLat=52');
  assert.equal(search.status, 200);
  assert.equal(search.body.data.length, 1);
  const summary = await request(app).get('/api/map/summary');
  assert.equal(summary.status, 200);
  assert.equal(summary.body.data.total, 1);
  assert.equal(summary.body.data.by_category[0].category, 'Workplace');
  db.close();
});

test('validation and missing routes return JSON errors', async () => {
  const { app, db } = setup();
  const invalid = await request(app).post('/api/reports').send({ title: 'Missing coordinates' });
  assert.equal(invalid.status, 400);
  assert.match(invalid.body.error.message, /description is required/);
  const missing = await request(app).get('/api/reports/999');
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.body.error.message, 'string');
  const badPage = await request(app).get('/api/markers?page=0');
  assert.equal(badPage.status, 400);
  db.close();
});
