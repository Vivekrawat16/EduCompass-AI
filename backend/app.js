const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// ======================
// TRUST PROXY (Railway)
// ======================
app.set('trust proxy', 1);

// ======================
// CORS CONFIG (LOCAL + PRODUCTION)
// ======================
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://educompass-ai-production.up.railway.app" // ✅ your frontend URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS blocked: " + origin));
        }
    },
    credentials: true
}));

// ======================
// HELMET (CSP FIXED FOR GOOGLE AUTH)
// ======================
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://accounts.google.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://accounts.google.com",
                    "https://educompass-ai-production.up.railway.app" // ✅ backend allowed
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://*.googleusercontent.com"
                ],
                frameSrc: [
                    "'self'",
                    "https://accounts.google.com"
                ],
            },
        },
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

// ======================
// BODY PARSER & COOKIES
// ======================
app.use(express.json());
app.use(cookieParser());

// ======================
// SESSION CONFIG (🔥 MOST IMPORTANT FOR GOOGLE AUTH)
// ======================
app.use(
    session({
        name: "educompass.sid",
        secret: process.env.SESSION_SECRET || "super-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,        // ✅ MUST be true in Railway (HTTPS)
            sameSite: "none",     // ✅ MUST be none for cross-site OAuth
            httpOnly: true
        }
    })
);

// ======================
// PASSPORT INIT
// ======================
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// ======================
// LOGGER
// ======================
app.use(morgan('dev'));

// ======================
// ROUTES
// ======================
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/profile', require('./src/routes/profileRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/ai/counsellor', require('./src/routes/aiCounsellorRoutes'));
app.use('/api/universities', require('./src/routes/universityRoutes'));
app.use('/api/lock', require('./src/routes/lockRoutes'));
app.use('/api/applications', require('./src/routes/applicationRoutes'));

// ======================
// 404 API HANDLER
// ======================
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// ======================
// SERVE FRONTEND (REACT BUILD)
// ======================
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

module.exports = app;
