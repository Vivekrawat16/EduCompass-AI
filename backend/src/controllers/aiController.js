const University = require('../models/University');
const Shortlist = require('../models/Shortlist');
const Task = require('../models/Task');
const aiEngine = require('../ai/aiCounsellorEngine');
const { GeminiServiceError } = require('../services/geminiService');

exports.chat = async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    try {
        // 1. CALL AI ENGINE
        const aiResponse = await aiEngine.processUserRequest(userId, message);

        // 2. ACTION EXECUTION ENGINE
        const results = [];
        if (aiResponse.actions && Array.isArray(aiResponse.actions)) {
            for (const action of aiResponse.actions) {
                try {
                    if (action.type === 'shortlist') {
                        // Find University ID by Name
                        let uni = await University.findOne({ name: action.universityName }); // Exact match for now

                        if (!uni) {
                            // Try case-insensitive?
                            uni = await University.findOne({ name: { $regex: new RegExp(`^${action.universityName}$`, 'i') } });
                        }

                        if (!uni) {
                            // Insert placeholder if not found
                            uni = await University.create({
                                name: action.universityName,
                                country: action.country || 'Unknown'
                            });
                        }

                        // Create Shortlist (Upsert to prevent duplicates)
                        await Shortlist.findOneAndUpdate(
                            { user: userId, universityId: uni._id }, // or uni.id if using virtuals
                            {
                                universityName: uni.name,
                                category: action.category || 'Target',
                                country: uni.country
                            },
                            { upsert: true, new: true }
                        );

                        results.push(`Shortlisted ${action.universityName}`);
                    }

                    if (action.type === 'add_task') {
                        await Task.create({
                            user: userId,
                            title: action.task,
                            status: 'pending',
                            description: 'AI Generated Task'
                        });
                        results.push(`Added task: ${action.task}`);
                    }
                } catch (actionErr) {
                    console.error("Action Execution Failed:", actionErr);
                    results.push(`Failed to execute: ${action.type}`);
                }
            }
        }

        // 3. RETURN RESPONSE
        res.json({
            success: true,
            ai_message: aiResponse.message,
            analysis: aiResponse.analysis,
            recommendations: aiResponse.recommendations,
            actions_executed: results,
            original_actions: aiResponse.actions
        });

    } catch (error) {
        console.error("[AI Controller] Error:", error);

        // Handle specific Gemini service errors
        if (error instanceof GeminiServiceError) {
            const statusMap = {
                'API_KEY_MISSING': 503,
                'API_ERROR': 502,
                'NETWORK_ERROR': 503,
                'PROCESSING_ERROR': 500
            };

            const status = statusMap[error.code] || 500;
            return res.status(status).json({
                error: error.message,
                code: error.code,
                type: 'ai_service_error'
            });
        }

        // Handle other errors
        res.status(500).json({
            error: "An unexpected error occurred while processing your request.",
            type: 'server_error'
        });
    }
};

exports.recommend = async (req, res) => {
    // Trigger explicit recommendation flow
    req.body.message = "Analyze my profile and recommend universities strictly.";
    return exports.chat(req, res);
};

exports.actions = async (req, res) => {
    // Endpoint to manually execute actions if frontend sends them?
    // Implementation: Loop and execute.
    // For now, we'll assume chat handles it, but let's provide a stub.
    res.json({ message: "Actions are handled automatically via Chat endpoint." });
};

