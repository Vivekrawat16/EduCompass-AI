const pool = require('../../config/db');

// Stage ID to Enum mapping
const STAGE_MAP = {
    1: 'ONBOARDING',
    2: 'ONBOARDING',
    3: 'DISCOVERY',
    4: 'SHORTLISTING',
    5: 'SHORTLISTING',
    6: 'LOCKING',
    7: 'APPLICATION'
};

const STAGE_LABELS = {
    ONBOARDING: 'Stage 1: Building Profile',
    DISCOVERY: 'Stage 2: Discovering Universities',
    SHORTLISTING: 'Stage 3: Shortlisting Universities',
    LOCKING: 'Stage 4: Finalizing Universities',
    APPLICATION: 'Stage 5: Application Preparation'
};

// Calculate profile completion percentage based on filled fields
const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    const fields = [
        'education_level',
        'institution_name',
        'gpa',
        'target_country',
        'target_degree',
        'target_major',
        'budget',
        'funding_type',
        'test_scores'
    ];

    let filled = 0;
    for (const field of fields) {
        if (profile[field] && profile[field] !== '' && profile[field] !== null) {
            filled++;
        }
    }

    return Math.round((filled / fields.length) * 100);
};

exports.getUserStatus = async (req, res) => {
    try {
        // Fetch profile and stage data
        const result = await pool.query(
            `SELECT p.*, up.current_stage_id 
             FROM profiles p 
             JOIN user_progress up ON p.user_id = up.user_id 
             WHERE p.user_id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User data not found" });
        }

        const profile = result.rows[0];
        const stageId = profile.current_stage_id || 1;
        const stageEnum = STAGE_MAP[stageId] || 'ONBOARDING';
        const profileCompletion = calculateProfileCompletion(profile);

        res.json({
            isProfileComplete: profile.is_profile_complete,
            profileCompletion: profileCompletion,
            profileStatus: profile.is_profile_complete ? 'COMPLETE' : (profileCompletion >= 50 ? 'PARTIAL' : 'INCOMPLETE'),
            stageId: stageId,
            stage: stageEnum,
            stageLabel: STAGE_LABELS[stageEnum],
            stageNumber: Object.keys(STAGE_LABELS).indexOf(stageEnum) + 1
        });
    } catch (err) {
        console.error("[UserController] Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

// Export mappings for use by other controllers
exports.STAGE_MAP = STAGE_MAP;
exports.STAGE_LABELS = STAGE_LABELS;
