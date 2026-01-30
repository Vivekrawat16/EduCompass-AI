-- Add columns for High School specific details
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sat_score VARCHAR(50),
ADD COLUMN IF NOT EXISTS act_score VARCHAR(50),
ADD COLUMN IF NOT EXISTS school_board VARCHAR(100);
