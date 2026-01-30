const pool = require('../../config/db');
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
                        // This logic assumes name matching. In prod, we'd want IDs from the start.
                        // But since Gemini suggests names, we match or insert.
                        let uniId;
                        const dbUni = await pool.query("SELECT id FROM universities WHERE name = $1", [action.universityName]);

                        if (dbUni.rows.length > 0) {
                            uniId = dbUni.rows[0].id;
                        } else {
                            // Insert placeholder if not found (or fetch details if we could)
                            const insert = await pool.query(
                                "INSERT INTO universities (name, country) VALUES ($1, $2) RETURNING id",
                                [action.universityName, action.country || 'Unknown']
                            );
                            uniId = insert.rows[0].id;
                        }

                        await pool.query(
                            "INSERT INTO shortlists (user_id, university_id, category) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
                            [userId, uniId, action.category || 'Target']
                        );
                        results.push(`Shortlisted ${action.universityName}`);
                    }

                    if (action.type === 'add_task') {
                        await pool.query(
                            "INSERT INTO tasks (user_id, title, status, description) VALUES ($1, $2, 'pending', $3)",
                            [userId, action.task, 'AI Generated Task']
                        );
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

