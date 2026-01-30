const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(require('./config/passport').initialize());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('AI Counsellor API is running');
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/profile', require('./src/routes/profileRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes')); // Legacy Chat
app.use('/api/ai/counsellor', require('./src/routes/aiCounsellorRoutes')); // New Action Engine

app.use('/api/universities', require('./src/routes/universityRoutes'));
app.use('/api/lock', require('./src/routes/lockRoutes'));
app.use('/api/applications', require('./src/routes/applicationRoutes'));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
