const Profile = require('../models/Profile');

module.exports = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(403).json({ error: "Profile not found" });
        }

        if (!profile.is_profile_complete) {
            return res.status(403).json({ error: "Onboarding not completed", redirect: "/onboarding" });
        }

        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
