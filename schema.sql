CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  whatsapp    TEXT,
  instagram   TEXT,
  pain        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
