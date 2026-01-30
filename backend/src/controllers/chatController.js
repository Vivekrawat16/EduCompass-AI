const pool = require('../../config/db');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // 1. Get User Profile Context
        const profileRes = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
        const profile = profileRes.rows[0];

        // 2. Construct Mock AI Response based on detailed profile
        // In production, this context would be sent to OpenAI system prompt.

        let aiResponse = "";
        const lowerMsg = message.toLowerCase();

        // Personalized Intro Context
        const userContext = {
            budget: profile.budget || "undecided",
            country: profile.target_country || "anywhere",
            major: profile.target_major || "your field",
            gpa: profile.gpa || "N/A"
        };

        // Logic Router (Mocking AI intent recognition)
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            aiResponse = `Hello ${profile.full_name.split(' ')[0]}! I see you're targeting a ${profile.target_degree} in ${userContext.major}. How can I help you plan for ${userContext.country}?`;

        } else if (lowerMsg.includes('budget') || lowerMsg.includes('cost')) {
            if (userContext.budget === '< $20k') {
                aiResponse = `With a budget under $20k, we should focus on countries with low tuition like Germany (public universities) or scholarships in the US/Italy.`;
            } else if (userContext.budget === '> $60k') {
                aiResponse = `Your budget of over $60k gives you great flexibility! We can apply to top-tier private universities in the USA, UK, and Australia without funding constraints.`;
            } else {
                aiResponse = `A budget of ${userContext.budget} is workable for many state universities in the US, Canada, and most of Europe.`;
            }

        } else if (lowerMsg.includes('score') || lowerMsg.includes('gpa') || lowerMsg.includes('grade')) {
            if (parseFloat(userContext.gpa) >= 3.5 || userContext.gpa === '3.8') { // approximate check
                aiResponse = `Your academic profile is strong (${userContext.gpa}). You should aim for top 50 ranked universities.`;
            } else {
                aiResponse = `Your GPA (${userContext.gpa}) is decent. We can boost your profile by focusing on a strong SOP and high GRE scores to get into good programs.`;
            }

        } else if (lowerMsg.includes('ielts') || lowerMsg.includes('gre')) {
            const ielts = profile.ielts_score || 'Not Taken';
            const gre = profile.gre_score || 'Not Taken';
            aiResponse = `Currently, your IELTS status is "${ielts}" and GRE is "${gre}". Improving these scores is the fastest way to increase your admission chances.`;

        } else if (lowerMsg.includes('suggest') || lowerMsg.includes('university') || lowerMsg.includes('shortlist')) {
            aiResponse = `Based on your interest in ${userContext.major} in ${userContext.country}, I can generate a shortlist for you. Say "Start Discovery" to begin.`;

        } else {
            // Default interactive fallback
            aiResponse = `I understand you're looking for guidance on your ${userContext.major} journey to ${userContext.country}. Could you ask specifically about universities, budget, or exams?`;
        }

        // Check for stage advancement trigger
        let nextStage = false;
        if (lowerMsg.includes('start discovery') || lowerMsg.includes('find universities')) {
            aiResponse = "Exciting! I've unlocked the University Discovery module. You can now browse universities matched to your profile.";
            nextStage = true;

            // Advance to Stage 5 (Discovery) if not already there
            await pool.query("UPDATE user_progress SET current_stage_id = 5 WHERE user_id = $1 AND current_stage_id < 5", [userId]);
        }

        res.json({ response: aiResponse, advanceStage: nextStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
