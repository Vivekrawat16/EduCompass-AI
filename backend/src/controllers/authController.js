const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwtGenerator = require('../utils/jwtGenerator');

exports.register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        // 1. Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(401).json({ error: "User already exists" });
        }

        // 2. Bcrypt the password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 3. Insert user inside database
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
            [email, bcryptPassword]
        );

        // 4. Create Profile entry (mandatory for onboarding) - NOW WITH NAME
        await pool.query("INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)", [newUser.rows[0].id, full_name || 'Student']);

        // 5. Initialize Stage (Auth completed -> move to Onboarding)
        await pool.query(
            "INSERT INTO user_progress (user_id, current_stage_id) VALUES ($1, 2)",
            [newUser.rows[0].id]
        );

        // 6. Generate JWT token
        const token = jwtGenerator(newUser.rows[0].id);

        // 7. Send Cookie
        const isSecure = process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https');

        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax', // 'none' for cross-site cookie if https, 'lax' otherwise
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: "Registered Successfully", stage: 2 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        // 2. Check if incoming password is valid
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        // 3. Get User Stage
        const stageRes = await pool.query("SELECT current_stage_id FROM user_progress WHERE user_id = $1", [user.rows[0].id]);
        const stage = stageRes.rows[0]?.current_stage_id || 1;

        // 4. Give them the jwt token
        const token = jwtGenerator(user.rows[0].id);

        // 5. Send Cookie
        const isSecure = process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https');

        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: "Logged in Successfully", stage });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.logout = async (req, res) => {
    try {
        const isSecure = process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https');
        res.clearCookie('token', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax'
        });
        res.json("Logged out successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


exports.getMe = async (req, res) => {
    try {
        // req.user is already set by authorize middleware
        const stageRes = await pool.query("SELECT current_stage_id FROM user_progress WHERE user_id = $1", [req.user.id]);
        const stage = stageRes.rows[0]?.current_stage_id || 1;

        res.json({ isAuthenticated: true, stage, user: req.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
