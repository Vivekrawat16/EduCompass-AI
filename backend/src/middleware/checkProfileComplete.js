const pool = require('../../config/db');

module.exports = async (req, res, next) => {
    try {
        const user = await pool.query("SELECT is_profile_complete FROM profiles WHERE user_id = $1", [req.user.id]);

        if (user.rows.length === 0) {
            return res.status(403).json({ error: "Profile not found" });
        }

        if (!user.rows[0].is_profile_complete) {
            return res.status(403).json({ error: "Onboarding not completed", redirect: "/onboarding" });
        }

        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
