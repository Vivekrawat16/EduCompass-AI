const Profile = require('../models/Profile');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // 1. Get User Profile Context
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            // Handle case where profile doesn't exist (shouldn't happen for logged in user but safe guard)
            return res.json({ response: "I can't find your profile info. Please complete onboarding.", advanceStage: false });
        }

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

        const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'Student';
        const degree = profile.target_degree || 'degree'; // preferences is nested, but we have flat fields too

        // Logic Router (Mocking AI intent recognition)
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            aiResponse = `Hello ${firstName}! I see you're targeting a ${degree} in ${userContext.major}. How can I help you plan for ${userContext.country}?`;

        } else if (lowerMsg.includes('budget') || lowerMsg.includes('cost')) {
            // Simple logic
            aiResponse = `A budget of ${userContext.budget} is workable for many universities. We can find options that match.`;

        } else if (lowerMsg.includes('score') || lowerMsg.includes('gpa') || lowerMsg.includes('grade')) {
            if (parseFloat(userContext.gpa) >= 3.5 || userContext.gpa === '3.8') {
                aiResponse = `Your academic profile is strong (${userContext.gpa}). You should aim for top 50 ranked universities.`;
            } else {
                aiResponse = `Your GPA (${userContext.gpa}) is decent. We can boost your profile by focusing on a strong SOP.`;
            }

        } else if (lowerMsg.includes('ielts') || lowerMsg.includes('gre')) {
            // profile.test_scores is a Map.
            const scores = profile.test_scores || {};
            const getScore = (k) => scores.get ? scores.get(k) : scores[k];
            const ielts = getScore('ielts') || 'Not Taken';
            const gre = getScore('gre') || 'Not Taken';

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

            // Advance to Stage 3 (Discovery) if not already there
            if (profile.current_stage < 3) {
                profile.current_stage = 3;
                await profile.save();
            }
        }

        res.json({ response: aiResponse, advanceStage: nextStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
