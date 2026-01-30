const pool = require('../../config/db');

exports.getApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                lu.id as application_id,
                lu.status,
                lu.deadline,
                lu.notes,
                lu.locked_at,
                u.id as university_id,
                u.name as university_name,
                u.country,
                u.ranking
            FROM locked_universities lu
            JOIN universities u ON lu.university_id = u.id
            WHERE lu.user_id = $1
            ORDER BY lu.locked_at DESC
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);

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

        const updateQuery = `
            UPDATE locked_universities 
            SET status = COALESCE($1, status),
                deadline = COALESCE($2, deadline),
                notes = COALESCE($3, notes)
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [status, deadline, notes, id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json("Application not found");
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM locked_universities WHERE id = $1 AND user_id = $2", [id, req.user.id]);
        res.json("Application removed");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
