CREATE TABLE IF NOT EXISTS propaganda_techniques (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  real_examples JSONB NOT NULL DEFAULT '[]',
  psychology TEXT NOT NULL,
  how_to_recognize TEXT NOT NULL,
  how_to_avoid TEXT NOT NULL
);
