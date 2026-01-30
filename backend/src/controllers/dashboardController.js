const pool = require('../../config/db');

// Helper: Calculate Profile Strength
const calculateStrength = (profile) => {
    let score = 0;

    // 1. Academics (30 pts)
    if (profile.gpa) score += 20;
    if (profile.target_major) score += 10;

    // 2. Goals (20 pts)
    if (profile.target_country) score += 15;
    if (profile.budget) score += 5;

    // 3. Readiness (30 pts) - JSONB test_scores
    const scores = profile.test_scores || {};
    if (scores.ielts || scores.toefl) score += 15;
    if (scores.gre || scores.sat || scores.gmat) score += 15;

    // 4. Details (20 pts)
    if (profile.full_name) score += 20;

    // Determine Label
    let label = 'Weak';
    if (score > 80) label = 'Strong';
    else if (score > 50) label = 'Average';

    return { score, label };
};

// Helper: Generate AI Tasks based on Stage & Profile gaps
const generateTasks = async (userId, profile, stage) => {
    const tasks = [];
    const scores = profile.test_scores || {};

    // --- STAGE 1: PROFILE ---
    if (stage === 1 || stage === 2) {
        if (!scores.ielts && !scores.toefl) {
            tasks.push({ title: "Take Diagnostic English Test", description: "Assess your baseline for IELTS/TOEFL", category: "Exam", priority: "High" });
        }
        if (!profile.target_country) {
            tasks.push({ title: "Finalize Target Country", description: "Decide on your primary study destination", category: "Research", priority: "High" });
        }
    }

    // --- STAGE 2: DISCOVERY ---
    if (stage === 2) {
        tasks.push({ title: "Shortlist 8 Universities", description: "Use the Discovery tool to find initial options", category: "Research", priority: "High" });
        tasks.push({ title: "Research Scholarship Options", description: "Look for funding in your target country", category: "Finance", priority: "Medium" });
    }

    // --- STAGE 3: FINALIZING ---
    if (stage === 3) {
        tasks.push({ title: "Lock 3 Final Universities", description: "Select your top 3 choices to apply to", category: "Decision", priority: "High" });
        tasks.push({ title: "Draft Statement of Purpose", description: "Start writing your personal statement", category: "Docs", priority: "High" });
    }

    // --- STAGE 4: APPLICATION ---
    if (stage === 4) {
        tasks.push({ title: "Gather Transcripts", description: "Collect official academic records", category: "Docs", priority: "High" });
        tasks.push({ title: "Request Letters of Recommendation", description: "Contact professors/employers", category: "Docs", priority: "High" });
    }

    // Insert new tasks (ignore duplicates)
    for (const task of tasks) {
        const exists = await pool.query(
            "SELECT * FROM tasks WHERE user_id = $1 AND title = $2",
            [userId, task.title]
        );
        if (exists.rows.length === 0) {
            await pool.query(
                "INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, 'pending')",
                [userId, task.title, task.description]
            );
        }
    }
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Profile
        const profileRes = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
        const profile = profileRes.rows[0];

        // 2. Get Stage
        const stageRes = await pool.query("SELECT current_stage_id FROM user_progress WHERE user_id = $1", [userId]);
        const stage = stageRes.rows[0]?.current_stage_id || 1;

        // 3. Calculate Strength
        const strength = calculateStrength(profile);

        // 4. Generate AI Tasks
        await generateTasks(userId, profile, stage);

        // 5. Get Recent Tasks (Top 3 Pending)
        const tasksRes = await pool.query(
            "SELECT * FROM tasks WHERE user_id = $1 AND status != 'completed' ORDER BY created_at DESC LIMIT 3",
            [userId]
        );

        res.json({
            profile: {
                name: profile.full_name,
                country: profile.target_country || 'Undecided',
                major: profile.target_major || 'Undecided',
                budget: profile.budget || 'Not set',
                gpa: profile.gpa || 'N/A'
            },
            strength,
            stage,
            tasks: tasksRes.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY status DESC, created_at DESC", [userId]);
        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const updateTask = await pool.query(
            "UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
            [status, id, userId]
        );

        if (updateTask.rows.length === 0) {
            return res.json("This task is not yours or doesn't exist");
        }

        res.json("Task updated");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
