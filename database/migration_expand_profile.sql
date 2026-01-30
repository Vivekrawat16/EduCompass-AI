-- Add new columns for expanded profile information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS extracurricular_activities TEXT,
ADD COLUMN IF NOT EXISTS career_aspirations TEXT,
ADD COLUMN IF NOT EXISTS languages_known TEXT,
ADD COLUMN IF NOT EXISTS learning_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_university_type VARCHAR(50);
