-- Migration: Remove display_order field from papers table
-- Since SQLite doesn't support ALTER COLUMN to drop a column,
-- we need to recreate the table without the display_order field.

-- Step 1: Create new table without display_order
CREATE TABLE papers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  role TEXT,
  journal TEXT,
  status TEXT DEFAULT 'published',
  issue TEXT,
  link TEXT,
  year INTEGER,
  tags TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Step 2: Copy data from old table to new table (excluding display_order)
INSERT INTO papers_new (id, title, role, journal, status, issue, link, year, tags, created_at, updated_at)
SELECT id, title, role, journal, status, issue, link, year, tags, created_at, updated_at
FROM papers;

-- Step 3: Drop old table
DROP TABLE papers;

-- Step 4: Rename new table
ALTER TABLE papers_new RENAME TO papers;

