CREATE TABLE IF NOT EXISTS subscriber_followups (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
