PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  description TEXT,
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  publisher TEXT,
  accessed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(name, url)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
  latitude REAL NOT NULL CHECK(latitude >= -90 AND latitude <= 90),
  longitude REAL NOT NULL CHECK(longitude >= -180 AND longitude <= 180),
  location_name TEXT,
  severity INTEGER NOT NULL DEFAULT 3 CHECK(severity BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'reported' CHECK(status IN ('reported', 'verified', 'resolved', 'rejected')),
  evidence TEXT,
  reported_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  latitude REAL NOT NULL CHECK(latitude >= -90 AND latitude <= 90),
  longitude REAL NOT NULL CHECK(longitude >= -180 AND longitude <= 180),
  severity INTEGER NOT NULL DEFAULT 3 CHECK(severity BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'reported' CHECK(status IN ('reported', 'verified', 'resolved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_coordinates ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_markers_category ON markers(category_id);
CREATE INDEX IF NOT EXISTS idx_markers_status ON markers(status);
CREATE INDEX IF NOT EXISTS idx_markers_coordinates ON markers(latitude, longitude);
