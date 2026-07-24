CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_text TEXT NOT NULL,
  correct_answer JSONB NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  active_date DATE UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_id ON challenge_submissions(user_id);

CREATE OR REPLACE VIEW leaderboard AS
  SELECT u.id, u.name, COALESCE(x.total_xp, 0) AS total_xp,
         RANK() OVER (ORDER BY COALESCE(x.total_xp, 0) DESC) AS rank
  FROM users u
  LEFT JOIN user_xp x ON x.user_id = u.id
  WHERE u.role = 'user';
