-- Migration to add application tracking fields to locked_universities

BEGIN;

ALTER TABLE locked_universities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft';
ALTER TABLE locked_universities ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE locked_universities ADD COLUMN IF NOT EXISTS notes TEXT;

COMMIT;
