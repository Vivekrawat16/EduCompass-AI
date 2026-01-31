const Application = require('../models/Application');
const University = require('../models/University');
const Profile = require('../models/Profile');

exports.lockUniversity = async (req, res) => {
    try {
        const { university_id, university_data } = req.body;
        const user_id = req.user.id;

        // 1. Check if University exists in DB (or create it)
        let uni = await University.findOne({ sourceId: university_id }); // assuming frontend sends sourceId

        // If not found by sourceId, maybe check by name? or create one.
        // If the ID sent is from our DB (backend), then findById. 
        // But likely it's external ID from Hippo.

        if (!uni) {
            // Try by ID just in case
            try {
                uni = await University.findById(university_id);
            } catch (e) { }
        }

        if (!uni) {
            if (!university_data) {
                return res.status(400).json({ error: "University not found and no data provided" });
            }

            // Insert new university
            uni = await University.create({
                sourceId: university_id,
                name: university_data.name,
                country: university_data.country,
                ranking: university_data.ranking || 999,
                tuition_fee: university_data.tuition_fee ? `${university_data.tuition_fee}` : 'N/A',
                details: university_data
            });
        }

        // Check if already locked
        const existingLock = await Application.findOne({ user: user_id, universityId: uni.sourceId || uni._id }); // Match by reference
        // Note: Application model uses 'universityId' string field. 
        // We should standardise on what we store. Ideally the University _id if possible, or sourceId.
        // Let's store uni._id in 'universityId' field if it's a string, or simply keep consistency.
        // Actually, Application schema defined universityId as string.

        if (existingLock) {
            return res.status(400).json({ error: "University already locked" });
        }

        // Lock the university (Create Application)
        const newLock = await Application.create({
            user: user_id,
            universityId: uni.sourceId || uni._id, // Store link
            universityName: uni.name,
            country: uni.country,
            ranking: uni.ranking,
            status: 'Draft',
            lockedAt: Date.now()
        });

        // Check count to update stage
        const count = await Application.countDocuments({ user: user_id });

        let newStage = null;
        if (count >= 1) {
            // Update Profile stage to 7 (Application)
            const profile = await Profile.findOne({ user: user_id });
            if (profile && profile.current_stage < 7) {
                profile.current_stage = 7;
                await profile.save();
                newStage = 7;
            }
        }

        res.json({ locked: newLock, stage: newStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.unlockUniversity = async (req, res) => {
    try {
        const { university_id } = req.params;
        const user_id = req.user.id;

        // Delete using universityId field match
        // Note: user might be sending the Application ID or the University ID.
        // REST standard usually implies DELETE /lock/:id -> id of the resource (Application/Lock).
        // But the legacy code looked up by university_id.
        // Let's support both or stick to legacy behavior: DELETE /lock/:university_id

        // Find and delete
        const result = await Application.findOneAndDelete({
            user: user_id,
            $or: [{ universityId: university_id }, { _id: university_id }]
        });

        // Check remaining
        const count = await Application.countDocuments({ user: user_id });

        let newStage = 7;
        if (count === 0) {
            // Revert to stage 6 (Locking/Shortlisting)
            const profile = await Profile.findOne({ user: user_id });
            if (profile) {
                profile.current_stage = 6;
                await profile.save();
                newStage = 6;
            }
        }

        res.json({ unlocked: true, remainingLocks: count, stage: newStage });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getAllLocked = async (req, res) => {
    try {
        const user_id = req.user.id;
        const apps = await Application.find({ user: user_id }).sort({ lockedAt: -1 });

        // Map to legacy format expected by frontend
        // Legacy: id, locked_at, name, country, etc. (mixed fields from join)
        const result = apps.map(app => ({
            lock_id: app._id,
            locked_at: app.lockedAt,
            id: app.universityId, // The ID of the university
            name: app.universityName,
            country: app.country,
            ranking: app.ranking
        }));

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getLockedUniversity = async (req, res) => {
    // This seems to fetch A locked university? Or list? 
    // Legacy SQL: SELECT ... FROM locked .. JOIN uni ... WHERE user_id
    // Returns array but controller returns rows[0]. So it returns just ONE or first one?
    // Used for "Single locked uni" view?

    try {
        const user_id = req.user.id;
        const app = await Application.findOne({ user: user_id });

        if (!app) return res.json(null);

        res.json({
            locked_at: app.lockedAt,
            name: app.universityName,
            country: app.country,
            ranking: app.ranking
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};
