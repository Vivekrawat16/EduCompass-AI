const Profile = require('../models/Profile');
const Task = require('../models/Task');

// Helper: Calculate Profile Strength
const calculateStrength = (profile) => {
    let score = 0;

    // 1. Academics (30 pts)
    if (profile.gpa) score += 20;
    if (profile.target_major) score += 10;

    // 2. Goals (20 pts)
    if (profile.target_country) score += 15;
    if (profile.budget) score += 5;

    // 3. Readiness (30 pts) - Map or Object
    const scores = profile.test_scores || {};
    // Check if map or obj
    const getScore = (key) => scores.get ? scores.get(key) : scores[key];

    if (getScore('ielts') || getScore('toefl')) score += 15;
    if (getScore('gre') || getScore('sat') || getScore('gmat')) score += 15;

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
    const tasksToAdd = [];
    const scores = profile.test_scores || {};
    const getScore = (key) => scores.get ? scores.get(key) : scores[key];

    // --- STAGE 1: PROFILE ---
    if (stage === 1 || stage === 2) {
        if (!getScore('ielts') && !getScore('toefl')) {
            tasksToAdd.push({ title: "Take Diagnostic English Test", description: "Assess your baseline for IELTS/TOEFL", category: "Exam", priority: "High" });
        }
        if (!profile.target_country) {
            tasksToAdd.push({ title: "Finalize Target Country", description: "Decide on your primary study destination", category: "Research", priority: "High" });
        }
    }

    // --- STAGE 2: DISCOVERY ---
    if (stage === 2) {
        tasksToAdd.push({ title: "Shortlist 8 Universities", description: "Use the Discovery tool to find initial options", category: "Research", priority: "High" });
        tasksToAdd.push({ title: "Research Scholarship Options", description: "Look for funding in your target country", category: "Finance", priority: "Medium" });
    }

    // --- STAGE 3: FINALIZING ---
    if (stage === 3) {
        tasksToAdd.push({ title: "Shortlist 3 Final Universities", description: "Select your top 3 choices to apply to", category: "Decision", priority: "High" });
        tasksToAdd.push({ title: "Draft Statement of Purpose", description: "Start writing your personal statement", category: "Docs", priority: "High" });
    }

    // --- STAGE 4: APPLICATION ---
    if (stage === 4) {
        tasksToAdd.push({ title: "Gather Transcripts", description: "Collect official academic records", category: "Docs", priority: "High" });
        tasksToAdd.push({ title: "Request Letters of Recommendation", description: "Contact professors/employers", category: "Docs", priority: "High" });
    }

    // Insert new tasks (ignore duplicates)
    for (const task of tasksToAdd) {
        const exists = await Task.findOne({ user: userId, title: task.title });
        if (!exists) {
            await Task.create({
                user: userId,
                title: task.title,
                description: task.description,
                status: 'pending'
            });
        }
    }
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Profile
        // Mongoose findOne returns null if not found, SQL returns empty rows
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        // 2. Get Stage
        const stage = profile.current_stage || 1;

        // 3. Calculate Strength
        const strength = calculateStrength(profile);

        // 4. Generate AI Tasks
        await generateTasks(userId, profile, stage);

        // 5. Get Recent Tasks (Top 3 Pending)
        const tasks = await Task.find({ user: userId, status: { $ne: 'completed' } })
            .sort({ createdAt: -1 })
            .limit(3);

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
            tasks
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        // Sort by status (pending first) ?? Implementation choice:
        // 'pending' > 'in_progress' > 'completed'.
        // Simple sort by status might not work alphabetically.
        // Let's just sort by created for now or alphabetical.
        // Original SQL: ORDER BY status DESC, created_at DESC
        // SQL 'Pending' vs 'Completed'. P > C. So Pending comes first.

        const tasks = await Task.find({ user: userId }).sort({ status: -1, createdAt: -1 });
        res.json(tasks);
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

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: userId },
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.json("This task is not yours or doesn't exist");
        }

        res.json("Task updated");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
