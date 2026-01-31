import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import '../styles/LandingPage.css';

const TermsOfService = () => {
    return (
        <div className="landing-container">
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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--scholar-navy-900)' }}>Terms of Service</h1>
                <p style={{ color: 'var(--scholar-gray-600)', marginBottom: '2rem' }}>Last Updated: January 2026</p>

                <div className="policy-content" style={{ lineHeight: '1.8', color: '#334155' }}>
                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>1. Acceptance of Terms</h3>
                    <p>By accessing and using EduCompass AI, you accept and agree to be bound by the terms and provision of this agreement.</p>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>2. Use License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on EduCompass AI's website for personal, non-commercial transitory viewing only.</p>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1E293B' }}>3. Disclaimer</h3>
                    <p>The materials on EduCompass AI's website are provided on an 'as is' basis. EduCompass AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
