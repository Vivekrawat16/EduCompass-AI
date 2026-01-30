import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User, ChevronDown, LogOut, Settings, Eye, Edit, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import '../styles/ProfileMenu.css';

const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const dropdownRef = useRef(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                const data = response.data;

                // Fetch additional profile details
                const profileRes = await api.get('/dashboard/summary');
                const profileData = profileRes.data;

                setUserProfile({
                    email: data.email,
                    name: profileData.profile?.name || 'Student',
                    stage: profileData.stage || 1,
                    stageName: getStageName(profileData.stage || 1),
                    isComplete: profileData.profile?.target_country && profileData.profile?.budget
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };

        fetchProfile();
    }, []);

    // Get stage name helper
    const getStageName = (stage) => {
        const stages = {
            1: 'Building Profile',
            2: 'Discovering Universities',
            3: 'Finalizing Universities',
            4: 'Preparing Applications'
        };
        return stages[stage] || 'Getting Started';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    if (!userProfile) return null;

    return (
        <div className="profile-menu-container" ref={dropdownRef}>
            {/* Profile Avatar Button */}
            <button
                className="profile-avatar-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Profile menu"
            >
                <div className="avatar-circle">
                    <span className="avatar-initials">{getInitials(userProfile.name)}</span>
                    <div className="online-indicator"></div>
                </div>
                <ChevronDown
                    size={16}
                    className={`chevron-icon ${isOpen ? 'rotated' : ''}`}
                />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="profile-dropdown glass-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* User Info Section */}
                        <div className="dropdown-section user-info-section">
                            <div className="user-avatar-large">
                                {getInitials(userProfile.name)}
                            </div>
                            <div className="user-details">
                                <h4 className="user-name">{userProfile.name}</h4>
                                <p className="user-email">{userProfile.email}</p>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Status Section */}
                        <div className="dropdown-section status-section">
                            <div className="status-item">
                                <span className="status-label">Current Stage</span>
                                <div className="stage-badge">
                                    Stage {userProfile.stage}: {userProfile.stageName}
                                </div>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Profile Status</span>
                                <div className={`profile-status-badge ${userProfile.isComplete ? 'complete' : 'incomplete'}`}>
                                    {userProfile.isComplete ? (
                                        <>
                                            <CheckCircle size={14} />
                                            <span>Complete</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} />
                                            <span>Incomplete</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Quick Actions */}
                        <div className="dropdown-section actions-section">
                            <button
                                className="dropdown-action-btn"
                                onClick={() => {
                                    navigate('/profile');
                                    setIsOpen(false);
                                }}
                            >
                                <User size={18} />
                                <span>My Profile</span>
                            </button>
                            <button
                                className="dropdown-action-btn"
                                onClick={() => {
                                    navigate('/settings');
                                    setIsOpen(false);
                                }}
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Logout Button */}
                        <div className="dropdown-section logout-section">
                            <button
                                className="dropdown-action-btn logout-btn"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileMenu;
