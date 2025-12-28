-- Migration: Remove category field from papers table
-- Since SQLite doesn't support ALTER COLUMN to change NOT NULL constraint,
-- we need to recreate the table without the category field.

-- Step 1: Create new table without category
CREATE TABLE papers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  role TEXT,
  journal TEXT,
  status TEXT DEFAULT 'published',
  issue TEXT,
  link TEXT,
  year INTEGER,
  display_order INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Step 2: Copy data from old table to new table (excluding category)
INSERT INTO papers_new (id, title, role, journal, status, issue, link, year, display_order, tags, created_at, updated_at)
SELECT id, title, role, journal, status, issue, link, year, display_order, tags, created_at, updated_at
FROM papers;

-- Step 3: Drop old table
DROP TABLE papers;

-- Step 4: Rename new table
ALTER TABLE papers_new RENAME TO papers;

