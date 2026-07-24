CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('article','social','speech','blog','caption')),
  scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);

CREATE TABLE IF NOT EXISTS analysis_sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  sentence_text TEXT NOT NULL,
  category TEXT NOT NULL,
  technique TEXT,
  explanation TEXT,
  question TEXT,
  order_index INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analysis_sentences_analysis_id ON analysis_sentences(analysis_id);
