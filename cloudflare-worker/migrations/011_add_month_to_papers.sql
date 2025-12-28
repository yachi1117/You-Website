-- Migration: Add month field to papers table for year-month sorting
-- Since SQLite doesn't support ALTER COLUMN to add a column with a default,
-- we need to recreate the table with the new month field.

-- Step 1: Create new table with month field
CREATE TABLE papers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  role TEXT,
  journal TEXT,
  status TEXT DEFAULT 'published',
  issue TEXT,
  link TEXT,
  year INTEGER,
  month INTEGER,
  tags TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Step 2: Copy data from old table to new table
-- month will be NULL for existing records
INSERT INTO papers_new (id, title, role, journal, status, issue, link, year, month, tags, created_at, updated_at)
SELECT id, title, role, journal, status, issue, link, year, NULL as month, tags, created_at, updated_at
FROM papers;

-- Step 3: Drop old table
DROP TABLE papers;

-- Step 4: Rename new table
ALTER TABLE papers_new RENAME TO papers;

