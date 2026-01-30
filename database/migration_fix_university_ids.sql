-- Migration to support string IDs for universities (e.g., 'hippo-123')
-- This is necessary because the external API returns universities that aren't in our seeded DB.

BEGIN;

-- 1. Drop foreign key constraints temporarily
ALTER TABLE shortlists DROP CONSTRAINT IF EXISTS shortlists_university_id_fkey;
ALTER TABLE locked_universities DROP CONSTRAINT IF EXISTS locked_universities_university_id_fkey;

-- 2. Change column types to VARCHAR
ALTER TABLE universities ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE shortlists ALTER COLUMN university_id TYPE VARCHAR(255);
ALTER TABLE locked_universities ALTER COLUMN university_id TYPE VARCHAR(255);

-- 3. Re-add foreign key constraints
-- Note: We re-add them to ensure referential integrity, but now they point to a VARCHAR column.
ALTER TABLE shortlists ADD CONSTRAINT shortlists_university_id_fkey FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;
ALTER TABLE locked_universities ADD CONSTRAINT locked_universities_university_id_fkey FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;

COMMIT;
