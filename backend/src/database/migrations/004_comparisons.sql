CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_description TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON comparisons(user_id);

CREATE TABLE IF NOT EXISTS comparison_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  result JSONB,
  order_index INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comparison_articles_comparison_id ON comparison_articles(comparison_id);
