INSERT OR IGNORE INTO categories (name, description, color) VALUES
  ('Media', 'Bias in news, publishing, or broadcast media', '#2563eb'),
  ('Education', 'Bias in schools, curricula, or academic settings', '#16a34a'),
  ('Workplace', 'Bias in employment or professional settings', '#ea580c');

INSERT OR IGNORE INTO sources (name, url, publisher) VALUES
  ('BiasMap community submission', 'https://example.com/biasmap', 'BiasMap');

INSERT INTO reports
  (title, description, category_id, source_id, latitude, longitude, location_name, severity, status, evidence)
SELECT
  'Example report', 'A sample report for local development.', c.id, s.id,
  40.7128, -74.0060, 'New York, NY', 2, 'reported', 'Replace this seed data before production use.'
FROM categories c, sources s
WHERE c.name = 'Media' AND s.name = 'BiasMap community submission'
  AND NOT EXISTS (SELECT 1 FROM reports WHERE title = 'Example report');
