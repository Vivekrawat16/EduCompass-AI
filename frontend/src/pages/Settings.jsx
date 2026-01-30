import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Settings as SettingsIcon } from 'lucide-react';
import ProfileMenu from '../components/ProfileMenu';
import '../styles/Profile.css';

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-container">
            {/* Navigation */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <Globe size={24} className="brand-icon" />
                    <span>EduCompass AI</span>
                </div>
                <ProfileMenu />
            </nav>

            {/* Settings Content */}
            <div className="profile-content">
                <div className="profile-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1>Settings</h1>
                </div>

                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <SettingsIcon size={48} style={{ color: 'var(--neon-violet)', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Settings Coming Soon</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        This feature is under development. You'll be able to customize your preferences here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
