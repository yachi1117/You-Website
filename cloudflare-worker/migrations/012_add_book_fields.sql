-- Migration: Add publication_type, role, authors, and url fields to books table

-- Add new columns to books table
ALTER TABLE books ADD COLUMN publication_type TEXT;
ALTER TABLE books ADD COLUMN role TEXT;
ALTER TABLE books ADD COLUMN authors TEXT;
ALTER TABLE books ADD COLUMN url TEXT;

