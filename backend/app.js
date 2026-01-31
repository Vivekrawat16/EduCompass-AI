const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// ======================
// TRUST PROXY (AWS Load Balancer / Nginx)
// ======================
app.set('trust proxy', 1);

// ======================
// CORS CONFIGURATION (AWS EC2)
// ======================
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL || 'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// HELMET SECURITY (AWS Production)
// ======================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            connectSrc: [
                "'self'",
                process.env.BACKEND_URL || "'self'"
            ],
            imgSrc: ["'self'", "data:"],
            frameSrc: ["'self'"]
        }
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));



// ======================
// BODY PARSER & COOKIES
// ======================
app.use(express.json());
app.use(cookieParser());


// ======================
// LOGGING
// ======================
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ======================
// HEALTH CHECK ROUTE
// ======================
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ======================
// API ROUTES
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
// 404 HANDLER (API ONLY)
// ======================
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API route not found',
        path: req.path
    });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

module.exports = app;
