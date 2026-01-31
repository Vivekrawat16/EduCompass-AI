-- Database Schema for AI Counsellor

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    target_country VARCHAR(100),
    target_major VARCHAR(100),
    gpa DECIMAL(3, 2),
    test_scores JSONB, -- e.g., {"ielts": 7.5, "sat": 1400}
    budget VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stages Table (Lookup table for stages)
CREATE TABLE stages (
    id SERIAL PRIMARY KEY,
    stage_number INTEGER UNIQUE NOT NULL,
    stage_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Insert default stages
INSERT INTO stages (stage_number, stage_name, description) VALUES
(1, 'Authentication', 'Signup and Login'),
(2, 'Onboarding', 'Profile Creation'),
(3, 'Dashboard', 'Main Overview'),
(4, 'AI Counselling', 'AI Interaction'),
(5, 'University Discovery', 'Search and Shortlist'),
(6, 'University Locking', 'Final Selection'),
(7, 'Application', 'Tasks and Guidance');

-- User Progress Table (Tracks current stage)
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    current_stage_id INTEGER REFERENCES stages(id) DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Universities Table (Seed data or scraped)
CREATE TABLE universities (
    id VARCHAR(255) PRIMARY KEY, -- Changed from SERIAL to support external IDs
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    ranking INTEGER,
    tuition_fee VARCHAR(50),
    details JSONB -- specific program details etc.
);

-- Shortlists Table
CREATE TABLE shortlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    university_id VARCHAR(255) REFERENCES universities(id) ON DELETE CASCADE, -- Match type VARCHAR
    category VARCHAR(20) CHECK (category IN ('Dream', 'Target', 'Safe')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locked Universities Table
CREATE TABLE locked_universities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    university_id VARCHAR(255) REFERENCES universities(id) ON DELETE CASCADE, -- Match type VARCHAR
    status VARCHAR(50) DEFAULT 'Draft',
    deadline TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Completed
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
