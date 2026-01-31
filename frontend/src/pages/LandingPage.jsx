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
                {/* Hero Image Integration */}
                <div className="hero-visual">
                    <div className="visual-bg"></div>
                    <motion.img
                        src="/hero-globe.png"
                        alt="Global Education"
                        className="hero-3d-image"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    />
                    {/* Floating Badges */}
                    <motion.div className="floating-card card-match" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                        <div className="icon-box"><Zap size={20} /></div>
                        <div className="content">
                            <h4>AI Match</h4>
                            <p>98% Compatibility</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <h2>5000+</h2>
                    <p>Students Placed</p>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <h2>$2M+</h2>
                    <p>Scholarships Won</p>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <h2>98%</h2>
                    <p>Visa Success Rate</p>
                </div>
            </section>

            {/* Features (Refined) */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why Choose EduCompass?</h2>
                    <p>The only platform that combines AI precision with human expertise.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Sparkles size={28} /></div>
                        <h3>AI Counselor</h3>
                        <p>Get personalized university recommendations based on your academic profile, interests, and career goals.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><BookOpen size={28} /></div>
                        <h3>Smart Discovery</h3>
                        <p>Access a comprehensive database of global universities with detailed insights on acceptance rates and tuition.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><TrendingUp size={28} /></div>
                        <h3>Application Tracker</h3>
                        <p>Stay organized with a visual Kanban board to track deadlines, documents, and application statuses.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="process-section">
                <div className="section-header">
                    <h2>Your Journey to Success</h2>
                    <p>Simple steps to your dream university.</p>
                </div>
                <div className="process-steps">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Create Profile</h3>
                        <p>Input your grades, interests, and budget. Our AI builds your unique academic identity.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>Get Matched</h3>
                        <p>Receive a tailored list of Dream, Target, and Safe universities with admission predictions.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Apply & Track</h3>
                        <p>Use our step-by-step guidance to submit applications and track decision status.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-col footer-brand">
                        <h3><Globe size={24} /> EduCompass AI</h3>
                        <p>Empowering students to achieve their global education dreams through intelligent guidance.</p>
                    </div>

                    <div className="footer-col">
                        <h4>Platform</h4>
                        <ul className="footer-links">
                            <li><Link to="/universities">Universities</Link></li>
                            <li><Link to="/signup">Start Free</Link></li>
                            <li><Link to="/login">Sign In</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} EduCompass AI. All rights reserved.</p>
                    <div className="social-links">
                        {/* Placeholder for social icons */}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
