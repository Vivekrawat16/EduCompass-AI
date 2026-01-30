const pool = require('../../config/db');

exports.lockUniversity = async (req, res) => {
    try {
        const { university_id, university_data } = req.body;
        const user_id = req.user.id;

        // 1. Check if University exists in DB (for external Hippo IDs)
        const uniCheck = await pool.query("SELECT * FROM universities WHERE id = $1", [university_id]);

        if (uniCheck.rows.length === 0) {
            if (!university_data) {
                return res.status(400).json({ error: "University not found and no data provided" });
            }

            // Insert the new university from external API to our DB
            await pool.query(
                `INSERT INTO universities (id, name, country, ranking, tuition_fee, details) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    university_id, // Now a string (VARCHAR)
                    university_data.name,
                    university_data.country,
                    university_data.ranking || 999,
                    university_data.tuition_fee ? `${university_data.tuition_fee}` : 'N/A',
                    JSON.stringify(university_data) // Store full object in details
                ]
            );
        }

        // Check if already locked
        const existingLock = await pool.query(
            "SELECT * FROM locked_universities WHERE user_id = $1 AND university_id = $2",
            [user_id, university_id]
        );

        if (existingLock.rows.length > 0) {
            return res.status(400).json({ error: "University already locked" });
        }

        // Lock the university
        const newLock = await pool.query(
            "INSERT INTO locked_universities (user_id, university_id) VALUES ($1, $2) RETURNING *",
            [user_id, university_id]
        );

        // Check if this is first lock - advance to Application stage
        const lockCount = await pool.query(
            "SELECT COUNT(*) FROM locked_universities WHERE user_id = $1",
            [user_id]
        );

        if (parseInt(lockCount.rows[0].count) >= 1) {
            await pool.query(
                "UPDATE user_progress SET current_stage_id = 7 WHERE user_id = $1 AND current_stage_id < 7",
                [user_id]
            );
        }

        res.json({ locked: newLock.rows[0], stage: 7 });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.unlockUniversity = async (req, res) => {
    try {
        const { university_id } = req.params;
        const user_id = req.user.id;

        await pool.query(
            "DELETE FROM locked_universities WHERE user_id = $1 AND university_id = $2",
            [user_id, university_id]
        );

        // Check remaining locks - if 0, revert stage to LOCKING
        const remaining = await pool.query(
            "SELECT COUNT(*) FROM locked_universities WHERE user_id = $1",
            [user_id]
        );

        let newStage = 7;
        if (parseInt(remaining.rows[0].count) === 0) {
            await pool.query(
                "UPDATE user_progress SET current_stage_id = 6 WHERE user_id = $1",
                [user_id]
            );
            newStage = 6;
        }

        res.json({ unlocked: true, remainingLocks: parseInt(remaining.rows[0].count), stage: newStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getAllLocked = async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(
            `SELECT l.id as lock_id, l.locked_at, u.* 
             FROM locked_universities l
             JOIN universities u ON l.university_id = u.id
             WHERE l.user_id = $1
             ORDER BY l.locked_at DESC`,
            [user_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getLockedUniversity = async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(
            `SELECT l.locked_at, u.name, u.country, u.ranking 
             FROM locked_universities l
             JOIN universities u ON l.university_id = u.id
             WHERE l.user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};
