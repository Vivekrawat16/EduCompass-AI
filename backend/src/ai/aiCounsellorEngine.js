const Profile = require('../models/Profile');
const Task = require('../models/Task');
const Shortlist = require('../models/Shortlist');

// ... (keep systemInstruction and other helpers)


const geminiService = require('../services/geminiService');
const hippoService = require('../services/hippo.service');

// ==========================================
// CLASSIFICATION SYSTEM (Rule Engine)
// ==========================================
const classifyUniversities = (universities, profile) => {
    const classified = {
        dream: [],
        target: [],
        safe: []
    };

    // User Metrics
    const userGPA = parseFloat(profile.gpa) || 3.0;
    // const userBudget = parseFloat(profile.budget_max) || 50000;

    // Process each university
    universities.forEach(uni => {
        // 1. Enrich with Mock Data if missing (Essential for Logic)
        // In production, this data comes from DB. For now, we simulate Ranking/Acceptance if not present.
        const ranking = uni.ranking || Math.floor(Math.random() * 500) + 1; // 1-500
        const acceptanceRate = uni.acceptance_rate || (ranking < 50 ? 0.1 : (ranking < 200 ? 0.3 : 0.7));

        let score = 0;

        // 2. GPA Match Logic
        // Estimate req GPA based on ranking
        let reqGPA = 2.5;
        if (ranking <= 50) reqGPA = 3.8;
        else if (ranking <= 100) reqGPA = 3.5;
        else if (ranking <= 300) reqGPA = 3.0;

        const gpaDiff = userGPA - reqGPA;
        if (gpaDiff >= 0.2) score += 3; // Safe
        else if (gpaDiff >= -0.1) score += 1; // Target
        else score -= 2; // Reach/Dream

        // 3. Acceptance Probability Logic
        if (acceptanceRate > 0.5) score += 1;
        if (acceptanceRate < 0.2) score -= 1;

        // 4. Categorize based on Score
        let category = 'Dream';
        if (score >= 3) category = 'Safe';
        else if (score >= 0) category = 'Target';

        // Force Dream for Top 20 if logic suggests 'Target' but user is average, just to be safe (Rule Override)
        if (ranking <= 20 && userGPA < 3.9) category = 'Dream';

        // Add to buckets
        uni.category = category;
        uni.stats = { ranking, acceptanceRate, reqGPA }; // Pass reasoning stats to AI

        if (category === 'Dream') classified.dream.push(uni);
        else if (category === 'Target') classified.target.push(uni);
        else classified.safe.push(uni);
    });

    return classified;
};

// ==========================================
// CORE ENGINE
// ==========================================
const processUserRequest = async (userId, userMessage) => {
    console.log(`[AI Engine] Processing for User: ${userId}`);

    // 1. DATA AGGREGATION
    // 1. DATA AGGREGATION
    const profile = await Profile.findOne({ user: userId });

    // Stage is now inside Profile (schema migration: current_stage)
    const stage = profile ? profile.current_stage : 1;

    // Tasks
    const tasks = await Task.find({ user: userId, status: { $ne: 'completed' } });

    // Shortlists
    const shortlists = await Shortlist.find({ user: userId });

    // No need to unwrap .rows anymore, Mongoose returns objects/arrays directly.

    // Map stage ID to string if needed by AI, or keep as number. 
    // AI expects "Exploration" etc? 
    // Original code: progressRes.rows[0]?.current_stage_id || 'Exploration';
    // If it was a number before, keep number. If string, map it.
    // Our Profile model defaults current_stage to 1.
    // Let's rely on number for now or map it if the prompting uses specific terms.
    // The prompt context uses it: "Current Stage: ${context.stage}"
    // Let's keep it simple.

    // 2. FETCH UNIVERSITIES (If needed for recommendation context)
    // If the user's message implies looking for universities, or if we just want to provide context.
    // We'll fetch a small batch based on preference to allow AI to recommend.
    let relevantUniversities = [];
    if (profile.target_country) {
        // Fetch from external service or DB
        const allUnis = await hippoService.fetchUniversities(profile.target_country);
        // Slice top 20 for analysis to save tokens, or filter by user preferences if possible
        const candidates = allUnis.slice(0, 30);

        // 3. CLASSIFY
        const classified = classifyUniversities(candidates, profile);
        // Flatten for context, but keep category info
        relevantUniversities = [...classified.dream, ...classified.target, ...classified.safe];
    }

    // 4. CONSTRUCT CONTEXT
    const context = {
        user_profile: {
            name: profile.full_name,
            gpa: profile.gpa,
            major: profile.preferred_major,
            country: profile.target_country,
            budget: profile.budget_max,
            stage: stage
        },
        current_tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
        shortlisted_ids: shortlists.map(s => s.university_id),
        available_universities_sample: relevantUniversities.slice(0, 15).map(u => ({
            name: u.name,
            country: u.country,
            category: u.category,
            stats: u.stats
        }))
    };

    // 5. SYSTEM PROMPT
    const prompt = `
    You are the 'EduCompass AI Counsellor', an intelligent agent helping students apply for studies abroad.
    
    YOUR GOAL:
    Analyze the user's profile and the context provided to give expert advice, recommend universities, and manage tasks.
    
    INPUT DATA:
    - User Profile & Stage
    - Current Tasks
    - A sample of Universities (Pre-classified as Dream/Target/Safe by the Rule Engine).

    USER MESSAGE:
    "${userMessage}"

    RESPONSE REQUIREMENTS:
    1. **Strict JSON format** as defined below.
    2. **Analysis**: Briefly explain your reasoning (e.g., "Your GPA is strong for X but Y is competitive...").
    3. **Recommendations**: If asking for unis, pick from the provided list or suggest real well-known ones.
    4. **Actions**:
       - "shortlist": If user says "I like X" or "Add X".
       - "add_task": If user says "Remind me to..." or "I need to do...".
       - "next_step": Suggest the next logical step based on their 'stage'.
    
    JSON SCHEMA:
    {
      "analysis": "string",
      "recommendations": {
        "dream": ["Univ Name 1"],
        "target": ["Univ Name 2"],
        "safe": ["Univ Name 3"]
      },
      "actions": [
        { "type": "shortlist", "universityName": "Name", "category": "Dream/Target/Safe" },
        { "type": "add_task", "task": "Task Title" },
        { "type": "next_step", "step": "Description" }
      ],
      "message": "Friendly natural language response to the student."
    }
    `;

    // 6. CALL GEMINI
    const aiResponse = await geminiService.generateAIResponse(prompt, context);

    return aiResponse;
};

module.exports = {
    processUserRequest,
    classifyUniversities
};
