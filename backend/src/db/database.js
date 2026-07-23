const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function createDatabase(options = {}) {
  const configuredPath = options.dbPath || process.env.DB_PATH ||
    path.join(__dirname, '..', '..', 'data', 'biasmap.sqlite');
  const dbPath = configuredPath === ':memory:' ? configuredPath : path.resolve(configuredPath);
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  const schemaCandidates = [
    process.env.SCHEMA_PATH,
    path.join(__dirname, '..', '..', '..', 'database', 'schema.sql'),
    path.join(__dirname, '..', '..', 'database', 'schema.sql'),
    path.join(process.cwd(), '..', 'database', 'schema.sql')
  ].filter(Boolean);
  const schemaPath = schemaCandidates.find((candidate) => fs.existsSync(candidate));
  if (!schemaPath) throw new Error('database/schema.sql could not be found');
  db.exec(fs.readFileSync(schemaPath, 'utf8'));

  if (options.seed || process.env.SEED_DATABASE === 'true') {
    const seedPath = schemaPath.replace(/schema\.sql$/, 'seed.sql');
    db.exec(fs.readFileSync(seedPath, 'utf8'));
  }
  return db;
}

module.exports = { createDatabase };
