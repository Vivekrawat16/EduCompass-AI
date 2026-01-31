import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import '../styles/Dashboard.css'; // Reusing Dashboard styles for nav

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <nav className="dashboard-nav">
            <div className="nav-brand">
                <Globe size={20} />
                <span>EduCompass AI</span>
            </div>
            <div className="nav-links">
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                <Link to="/chat" className={isActive('/chat')}>AI Counsellor</Link>
                <Link to="/discovery" className={isActive('/discovery')}>Universities</Link>
                <Link to="/tracker" className={isActive('/tracker')}>Applications</Link>
            </div>
            <ProfileMenu />
        </nav>
    );
};

export default Header;
