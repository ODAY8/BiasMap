const { Pool } = require('pg');
const { db } = require('./env');

const pool = new Pool({
  connectionString: db.url,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error', err);
});

module.exports = pool;
