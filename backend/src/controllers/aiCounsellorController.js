const aiCounsellorService = require('../services/aiCounsellor.service');
const Profile = require('../models/Profile');
const Shortlist = require('../models/Shortlist');
const University = require('../models/University');

exports.chat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        // 1. Fetch User Profile
        const userProfile = await Profile.findOne({ user: userId });

        // 2. Fetch Shortlist
        const shortlists = await Shortlist.find({ user: userId });
        // Map to format expected by AI service (name, category)
        // Shortlist model has universityName stored.
        const shortlist = shortlists.map(s => ({
            name: s.universityName,
            category: s.category
        }));

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
        // 1. Find University ID (Case insensitive)
        let uni = await University.findOne({ name: { $regex: new RegExp(uni_name, 'i') } });

        if (!uni) {
            console.warn(`[Action] University not found: ${uni_name}`);
            // Optional: Create it? For now, just log.
            return;
        }

        // 2. Insert into Shortlist
        await Shortlist.findOneAndUpdate(
            { user: userId, universityId: uni.sourceId || uni._id },
            {
                universityName: uni.name,
                country: uni.country,
                category: category || 'Target'
            },
            { upsert: true, new: true }
        );
    }
}


