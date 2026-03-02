-- Add slug column to episodes table
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create an index to speed up slug lookups
CREATE INDEX IF NOT EXISTS episodes_slug_idx ON episodes (slug);
