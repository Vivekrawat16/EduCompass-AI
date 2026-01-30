const pool = require('../../config/db');

exports.lockUniversity = async (req, res) => {
    try {
        const { university_id } = req.body;
        const user_id = req.user.id;

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
