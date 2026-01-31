import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import '../styles/LandingPage.css';

const PrivacyPolicy = () => {
    return (
        <div className="landing-container">
            {/* Public Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
                        <Globe size={24} className="brand-icon" />
                        <span>EduCompass AI</span>
                    </Link>
                    <div className="nav-actions">
                        <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="features-section" style={{ paddingTop: '8rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--scholar-navy-900)' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--scholar-gray-600)', marginBottom: '2rem' }}>Last Updated: January 2026</p>

                <div className="policy-content" style={{ lineHeight: '1.8', color: '#334155' }}>
                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>1. Introduction</h3>
                    <p>Welcome to EduCompass AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>2. Data We Collect</h3>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data, Contact Data, Technical Data, and Usage Data.</p>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>3. How We Use Your Data</h3>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to Provide the Service, Improve Customer Experience, and for AI Personalization.</p>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>4. Data Security</h3>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
