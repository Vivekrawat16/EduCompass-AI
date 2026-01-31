const Application = require('../models/Application');
const University = require('../models/University'); // If used for looking up details

exports.getApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const applications = await Application.find({ user: userId }).sort({ lockedAt: -1 });

        // Map to match frontend format
        // Frontend expects: application_id, status, deadline, notes, locked_at, university_id, university_name, country, ranking
        // Our Model: _id, universityId, universityName, country, ranking, status, deadline, notes, lockedAt

        const response = applications.map(app => ({
            application_id: app._id,
            status: app.status,
            deadline: app.deadline,
            notes: app.notes,
            locked_at: app.lockedAt,
            university_id: app.universityId,
            university_name: app.universityName,
            country: app.country,
            ranking: app.ranking
        }));

        res.json(response);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status, deadline, notes } = req.body;

        const updatedApp = await Application.findOneAndUpdate(
            { _id: id, user: userId },
            {
                $set: {
                    ...(status && { status }),
                    ...(deadline && { deadline }),
                    ...(notes && { notes })
                }
            },
            { new: true }
        );

        if (!updatedApp) {
            return res.status(404).json("Application not found");
        }

        res.json(updatedApp);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        await Application.findOneAndDelete({ _id: id, user: req.user.id });
        res.json("Application removed");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
