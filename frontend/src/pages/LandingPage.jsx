import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Sparkles, Target, TrendingUp, ArrowRight, Zap, BookOpen } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <div className="nav-brand">
                        <Globe size={24} className="brand-icon" />
                        <span>EduCompass AI</span>
                    </div>
                    <div className="nav-actions">
                        <Link to="/login" className="nav-link">Sign In</Link>
                        <Link to="/signup" className="btn-primary">Start Journey</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="hero-badge">
                        <Sparkles size={16} />
                        <span>AI-Powered Study Abroad Platform</span>
                    </div>

                    <h1 className="hero-title">
                        Your AI Guide to <br />
                        <span className="highlight">Global Education</span>
                    </h1>

                    <p className="hero-subtitle">
                        Discover world-class universities, track your applications, and build your future with intelligent, personalized guidance.
                    </p>

                    <div className="hero-cta">
                        <Link to="/signup" className="btn-primary btn-large">
                            Start Your Study Journey
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn-secondary btn-large">
                            Explore Universities
                        </Link>
                    </div>
                </motion.div>

                {/* Visuals */}
                <div className="hero-visual">
                    <div className="visual-bg"></div>

                    <motion.div
                        className="floating-card card-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="icon-box">
                            <Zap size={24} />
                        </div>
                        <div className="floating-card-content">
                            <h4>AI Match</h4>
                            <p>98% Compatibility</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="floating-card card-2"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="icon-box">
                            <Target size={24} />
                        </div>
                        <div className="floating-card-content">
                            <h4>Profile Score</h4>
                            <p>Strong Applicant</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="floating-card card-3"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="icon-box">
                            <Globe size={24} />
                        </div>
                        <div className="floating-card-content">
                            <h4>Global Reach</h4>
                            <p>500+ Universities</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon">
                        <Sparkles size={32} />
                    </div>
                    <h3>AI Counselor</h3>
                    <p>Get personalized university recommendations based on your academic profile, interests, and career goals.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <BookOpen size={32} />
                    </div>
                    <h3>Smart Discovery</h3>
                    <p>Access a comprehensive database of global universities with detailed insights on acceptance rates and tuition.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">
                        <TrendingUp size={32} />
                    </div>
                    <h3>Application Tracker</h3>
                    <p>Stay organized with a visual Kanban board to track deadlines, documents, and application statuses.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
