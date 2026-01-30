const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;
                const fullName = profile.displayName;

                // 1. Check if user exists by Google ID
                const googleUser = await pool.query(
                    "SELECT * FROM users WHERE google_id = $1",
                    [googleId]
                );

                if (googleUser.rows.length > 0) {
                    return done(null, googleUser.rows[0]);
                }

                // 2. Check if user exists by Email (link accounts)
                const emailUser = await pool.query(
                    "SELECT * FROM users WHERE email = $1",
                    [email]
                );

                if (emailUser.rows.length > 0) {
                    // Link Google ID to existing user
                    const updatedUser = await pool.query(
                        "UPDATE users SET google_id = $1, auth_provider = 'google' WHERE email = $2 RETURNING *",
                        [googleId, email]
                    );
                    return done(null, updatedUser.rows[0]);
                }

                // 3. Create new user
                const newUser = await pool.query(
                    "INSERT INTO users (email, google_id, auth_provider, password_hash) VALUES ($1, $2, 'google', NULL) RETURNING *",
                    [email, googleId]
                );

                // Create initial profile for new user
                await pool.query(
                    "INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)",
                    [newUser.rows[0].id, fullName]
                );

                // Initialize stages
                await pool.query(
                    "INSERT INTO user_progress (user_id, current_stage_id) VALUES ($1, 1)",
                    [newUser.rows[0].id]
                );

                return done(null, newUser.rows[0]);

            } catch (err) {
                return done(err, null);
            }
        }
    ));
} else {
    console.warn("[Passport] Google Client ID/Secret not found. Google OAuth disabled.");
}

module.exports = passport;
