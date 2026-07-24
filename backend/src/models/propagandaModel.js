const pool = require('../config/db');

const findAll = () =>
  pool.query('SELECT * FROM propaganda_techniques ORDER BY id').then(r => r.rows);

const findById = (id) =>
  pool.query('SELECT * FROM propaganda_techniques WHERE id = $1', [id]).then(r => r.rows[0]);

module.exports = { findAll, findById };
