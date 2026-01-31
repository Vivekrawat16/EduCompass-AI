const Profile = require('../models/Profile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            // Should be created at registration, but just in case
            return res.status(404).json({ msg: "Profile not found" });
        }
        res.json(profile);
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

        // Map step data to profile fields
        let updateFields = {
            onboarding_step: step + 1, // Advance to next step
            updatedAt: Date.now()
        };

        // Note: The original SQL mapped step 1 -> step 2 next. 
        // If step starts at 1, we save data and set next step.

        if (step === 1) {
            // Academic Background
            updateFields = {
                ...updateFields,
                'education.level': data.education_level,
                'education.major': data.degree_major, // Mapping degree_major -> education.major
                'education.completionYear': data.graduation_year,
                'education.gpa': data.gpa,
                'education.board': data.school_board,

                // Backwards compatibility keys (if needed by frontend directly)
                education_level: data.education_level,
                degree_major: data.degree_major,
                graduation_year: data.graduation_year,
                gpa: data.gpa,
                school_board: data.school_board
            };
        } else if (step === 2) {
            // Study Goals
            updateFields = {
                ...updateFields,
                'preferences.target_degree': data.target_degree,
                'preferences.target_major': data.target_major,
                'preferences.target_country': data.target_country,
                'preferences.budget': data.budget,

                target_degree: data.target_degree,
                target_major: data.target_major,
                target_country: data.target_country,
                budget: data.budget
            };
        } else if (step === 3) {
            // Budget & Funding (Merging into preferences or flat)
            updateFields = {
                ...updateFields,
                'preferences.budget': data.budget,
                'preferences.funding_type': data.funding_type,

                budget: data.budget,
                funding_type: data.funding_type
            };
        } else if (step === 4) {
            // Readiness
            // We use a Map for test_scores in Mongoose Profile
            // Need to constructing the update object for Map is tricky with dot notation if keys vary.
            // But we can just set the whole object if we want, or individual keys.
            // Let's use flattened keys for specific known tests

            const scores = {};
            if (data.ielts_score) scores['ielts'] = data.ielts_score;
            if (data.gre_score) scores['gre'] = data.gre_score;
            if (data.sat_score) scores['sat'] = data.sat_score;
            if (data.act_score) scores['act'] = data.act_score;

            updateFields = {
                ...updateFields,
                test_scores: scores, // This might overwrite existing map? Yes. 
                // If we want merge, we should use $set: { "test_scores.ielts": ... }
                // But for simplicity, replacing the object is fine for this step.

                work_experience: data.work_experience,

                // Backward compat
                ielts_score: data.ielts_score,
                gre_score: data.gre_score,
                sat_score: data.sat_score,
                act_score: data.act_score
            };
        } else if (step === 5) {
            // Personal Insights
            updateFields = {
                ...updateFields,
                extracurricular_activities: data.extracurricular_activities,
                career_aspirations: data.career_aspirations,
                languages_known: data.languages_known,
                learning_style: data.learning_style,
                preferred_university_type: data.preferred_university_type,
                is_profile_complete: true
            };
        }

        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: updateFields },
            { new: true, upsert: true }
        );

        let newStage = null;
        if (step === 5) {
            // Advance stage
            if (profile.current_stage === 2) {
                profile.current_stage = 3;
                await profile.save();
                newStage = 3;
            }
        }

        res.json({ profile, stage: newStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Comprehensive profile update
exports.updateProfile = async (req, res) => {
    try {
        const updateData = req.body;
        const userId = req.user.id;

        // This accepts a flat structure from the frontend edit form
        // We just save it flat to valid schema fields. 
        // We should map it to nested fields if we want to be strict, 
        // but since our schema includes the flat fields for compat, we can just spread it.

        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            { $set: { ...updateData, updatedAt: Date.now() } },
            { new: true }
        );

        let newStage = null;
        if (profile.target_country && profile.budget) {
            if (profile.current_stage === 2) {
                profile.current_stage = 3;
                profile.is_profile_complete = true;
                await profile.save();
                newStage = 3;
            }
        }

        res.json({
            profile: profile,
            stage: newStage || profile.current_stage
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
