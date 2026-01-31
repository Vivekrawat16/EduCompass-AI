const pool = require('../../config/db');

exports.getProfile = async (req, res) => {
    try {
        const profile = await pool.query(
            "SELECT * FROM profiles WHERE user_id = $1",
            [req.user.id] // req.user comes from authorize middleware
        );
        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// New function: Save individual onboarding steps
exports.saveStep = async (req, res) => {
    try {
        const { step, data } = req.body;
        const userId = req.user.id;

        let updateQuery = "";
        let values = [];

        // Build query based on step
        if (step === 1) {
            // Academic Background: Added school_board for High School students
            const { education_level, degree_major, graduation_year, gpa, school_board } = data;
            updateQuery = "UPDATE profiles SET education_level = $1, degree_major = $2, graduation_year = $3, gpa = $4, school_board = $5, onboarding_step = $6, updated_at = NOW() WHERE user_id = $7 RETURNING *";
            values = [education_level, degree_major, graduation_year, gpa, school_board, 2, userId]; // Move to step 2
        } else if (step === 2) {
            // Study Goals
            const { target_degree, target_major, target_country, budget } = data;
            updateQuery = "UPDATE profiles SET target_degree = $1, target_major = $2, target_country = $3, budget = $4, onboarding_step = $5, updated_at = NOW() WHERE user_id = $6 RETURNING *";
            values = [target_degree, target_major, target_country, budget, 3, userId];
        } else if (step === 3) {
            // Budget & Funding
            const { budget, funding_type } = data;
            updateQuery = "UPDATE profiles SET budget = $1, funding_type = $2, onboarding_step = $3, updated_at = NOW() WHERE user_id = $4 RETURNING *";
            values = [budget, funding_type, 4, userId];
        } else if (step === 4) {
            // Readiness & Strength: Added sat_score, act_score
            // Note: Frontend sends whatever is relevant (gre/gmat vs sat/act), backend saves what it gets.
            const { ielts_score, gre_score, work_experience, sat_score, act_score } = data;
            updateQuery = "UPDATE profiles SET ielts_score = $1, gre_score = $2, work_experience = $3, sat_score = $4, act_score = $5, onboarding_step = $6, updated_at = NOW() WHERE user_id = $7 RETURNING *";
            values = [ielts_score, gre_score, work_experience, sat_score, act_score, 5, userId];
        } else if (step === 5) {
            // Personal Insights
            const { extracurricular_activities, career_aspirations, languages_known, learning_style, preferred_university_type } = data;
            updateQuery = "UPDATE profiles SET extracurricular_activities = $1, career_aspirations = $2, languages_known = $3, learning_style = $4, preferred_university_type = $5, onboarding_step = $6, is_profile_complete = $7, updated_at = NOW() WHERE user_id = $8 RETURNING *";
            values = [extracurricular_activities, career_aspirations, languages_known, learning_style, preferred_university_type, 5, true, userId];
        }

        if (!updateQuery) {
            return res.status(400).json({ error: "Invalid step" });
        }

        const updatedProfile = await pool.query(updateQuery, values);

        // If Step 5 is done, advance User Stage to 3 (Dashboard) if not already
        let newStage = null;
        if (step === 5) {
            const progress = await pool.query("SELECT current_stage_id FROM user_progress WHERE user_id = $1", [userId]);
            if (progress.rows[0].current_stage_id === 2) {
                await pool.query("UPDATE user_progress SET current_stage_id = 3 WHERE user_id = $1", [userId]);
                newStage = 3;
            }
        }

        res.json({ profile: updatedProfile.rows[0], stage: newStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Comprehensive profile update
exports.updateProfile = async (req, res) => {
    try {
        const {
            full_name,
            education_level,
            degree_major,
            graduation_year,
            gpa,
            school_board, // New
            target_degree,
            target_major,
            target_country,
            budget,
            funding_type,
            ielts_score,
            gre_score,
            work_experience,
            sat_score, // New
            act_score, // New
            extracurricular_activities,
            career_aspirations,
            languages_known,
            learning_style,
            preferred_university_type
        } = req.body;

        const updateQuery = `
            UPDATE profiles SET 
                full_name = COALESCE($1, full_name),
                education_level = COALESCE($2, education_level),
                degree_major = COALESCE($3, degree_major),
                graduation_year = COALESCE($4, graduation_year),
                gpa = COALESCE($5, gpa),
                school_board = COALESCE($6, school_board),
                target_degree = COALESCE($7, target_degree),
                target_major = COALESCE($8, target_major),
                target_country = COALESCE($9, target_country),
                budget = COALESCE($10, budget),
                funding_type = COALESCE($11, funding_type),
                ielts_score = COALESCE($12, ielts_score),
                gre_score = COALESCE($13, gre_score),
                work_experience = COALESCE($14, work_experience),
                sat_score = COALESCE($15, sat_score),
                act_score = COALESCE($16, act_score),
                extracurricular_activities = COALESCE($17, extracurricular_activities),
                career_aspirations = COALESCE($18, career_aspirations),
                languages_known = COALESCE($19, languages_known),
                learning_style = COALESCE($20, learning_style),
                preferred_university_type = COALESCE($21, preferred_university_type),
                updated_at = NOW()
            WHERE user_id = $22
            RETURNING *
        `;

        const values = [
            full_name,
            education_level,
            degree_major,
            graduation_year,
            gpa,
            school_board,
            target_degree,
            target_major,
            target_country,
            budget,
            funding_type,
            ielts_score,
            gre_score,
            work_experience,
            sat_score,
            act_score,
            extracurricular_activities,
            career_aspirations,
            languages_known,
            learning_style,
            preferred_university_type,
            req.user.id
        ];

        const updatedProfile = await pool.query(updateQuery, values);

        // Ensure profile is marked complete if critical fields are present
        let newStage = null;
        let currentStage = null;

        if (updatedProfile.rows[0].target_country && updatedProfile.rows[0].budget) {
            await pool.query("UPDATE profiles SET is_profile_complete = true WHERE user_id = $1", [req.user.id]);

            // Advance user stage to 3 (Discovery) if still in onboarding (stage 2)
            const progress = await pool.query("SELECT current_stage_id FROM user_progress WHERE user_id = $1", [req.user.id]);
            currentStage = progress.rows[0]?.current_stage_id;

            if (currentStage === 2) {
                await pool.query("UPDATE user_progress SET current_stage_id = 3 WHERE user_id = $1", [req.user.id]);
                newStage = 3;
            }
        }

        res.json({
            profile: updatedProfile.rows[0],
            stage: newStage || currentStage
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
