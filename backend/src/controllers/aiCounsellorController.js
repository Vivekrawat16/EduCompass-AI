const aiCounsellorService = require('../services/aiCounsellor.service');
const pool = require('../../config/db');

exports.chat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        // 1. Fetch User Profile
        const profileRes = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
        const userProfile = profileRes.rows[0];

        // 2. Fetch Shortlist
        const shortlistRes = await pool.query(
            "SELECT u.name, s.category FROM shortlists s JOIN universities u ON s.university_id = u.id WHERE s.user_id = $1",
            [userId]
        );
        const shortlist = shortlistRes.rows;

        // 3. Build Context
        const context = {
            profile: userProfile,
            shortlist: shortlist,
            // ToDo: Add stage from user table if needed
        };

        // 4. Call AI Service
        let aiResponse = await aiCounsellorService.chatWithCounsellor(message, context);

        // Fallback: If AI returned JSON but missed 'message' key (common LLM quirk)
        if (!aiResponse.message) {
            // Check for common alternatives
            aiResponse.message = aiResponse.response || aiResponse.answer || aiResponse.text || aiResponse.content || JSON.stringify(aiResponse);
        }

        // 5. SERVER-SIDE ACTION EXECUTION
        if (aiResponse.actions && Array.isArray(aiResponse.actions)) {
            for (const action of aiResponse.actions) {
                console.log(`[AICounsellor] Executing Action: ${action.type}`);
                try {
                    await executeBackendAction(userId, action);
                } catch (actionErr) {
                    console.error(`[AICounsellor] Action Failed: ${action.type}`, actionErr.message);
                }
            }
        }

        // 6. Return JSON to Frontend
        console.log("[AICounsellor] Response:", JSON.stringify(aiResponse, null, 2));
        res.json(aiResponse);

    } catch (err) {
        console.error("[AICounsellor] Error:", err.message);
        res.status(500).json({
            message: "I'm having trouble connecting to my brain right now. Please try again.",
            actions: []
        });
    }
};

/**
 * Helper to execute database actions driven by AI
 */
async function executeBackendAction(userId, action) {
    if (action.type === 'ADD_SHORTLIST') {
        const { uni_name, category } = action.data;
        // 1. Find University ID
        const uniRes = await pool.query("SELECT id FROM universities WHERE name ILIKE $1 LIMIT 1", [`%${uni_name}%`]);
        if (uniRes.rows.length === 0) {
            console.warn(`[Action] University not found: ${uni_name}`);
            return;
        }
        const uniId = uniRes.rows[0].id;

        // 2. Insert into Shortlist
        await pool.query(
            "INSERT INTO shortlists (user_id, university_id, category) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
            [userId, uniId, category || 'Target']
        );
    }
}
