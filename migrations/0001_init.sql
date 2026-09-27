CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  study_version TEXT NOT NULL,
  language TEXT NOT NULL,
  recruitment_source TEXT NOT NULL DEFAULT 'direct',
  recruitment_medium TEXT NOT NULL DEFAULT 'link',
  campaign TEXT NOT NULL DEFAULT 'none',
  cohort TEXT NOT NULL DEFAULT 'general',
  candidate_order TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  started_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_responses_language ON responses(language);
CREATE INDEX IF NOT EXISTS idx_responses_source ON responses(recruitment_source);
CREATE INDEX IF NOT EXISTS idx_responses_campaign ON responses(campaign);
CREATE INDEX IF NOT EXISTS idx_responses_cohort ON responses(cohort);
