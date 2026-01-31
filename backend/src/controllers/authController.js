const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwtGenerator = require('../utils/jwtGenerator');

exports.register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({ error: "User already exists" });
        }

        // 2. Bcrypt the password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        user = new User({
            email,
            password: bcryptPassword
        });
        await user.save();

        // 4. Create Profile (Mandatory)
        const profile = new Profile({
            user: user._id,
            full_name: full_name || 'Student',
            current_stage: 2 // Move to onboarding
        });
        await profile.save();

        // 5. Generate JWT token
        const token = jwtGenerator(user._id);

        // 6. Send Cookie
        const isSecure = process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https');

        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        // 2. Check password (if not Google auth user trying to login via password)
        if (!user.password) {
            return res.status(401).json({ error: "Please login with Google" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        // 3. Get User Stage from Profile
        const profile = await Profile.findOne({ user: user._id });
        const stage = profile ? profile.current_stage : 1;

        // 4. Generate Token
        const token = jwtGenerator(user._id);

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
        // req.user is set by authorize middleware (payload.user -> { id: ... })
        // We need to fetch the user details if needed, or just return id.
        // Frontend expects: { isAuthenticated: true, stage, user: ... }

        const profile = await Profile.findOne({ user: req.user.id });
        const stage = profile ? profile.current_stage : 1;

        // Fetch full user obj if needed, but req.user usually just has ID from JWT
        // Let's return basics
        res.json({ isAuthenticated: true, stage, user: { id: req.user.id } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
