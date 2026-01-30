import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, CheckSquare, GraduationCap, TrendingUp, Globe, Search,
    Kanban, Target, FileText, Sparkles, AlertCircle, ChevronRight, User, AlertTriangle
} from 'lucide-react';
import ProfileMenu from '../components/ProfileMenu';
import StageProgressTracker from '../components/StageProgressTracker';
import api from '../utils/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { logout } = useAuth();
    const [data, setData] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stage ID to Enum mapping
    const STAGE_ID_MAP = {
        1: 'ONBOARDING',
        2: 'ONBOARDING',
        3: 'DISCOVERY',
        4: 'SHORTLISTING',
        5: 'SHORTLISTING',
        6: 'LOCKING',
        7: 'APPLICATION'
    };

    const fetchData = async () => {
        try {
            const [dashRes, statusRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/user/status')
            ]);

            setData(dashRes.data);
            setUserStatus(statusRes.data);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskToggle = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic UI Update
        setData(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        }));

        try {
            await api.put(`/dashboard/tasks/${taskId}`, { status: newStatus });
        } catch (err) {
            console.error("Failed to update task", err);
            // Revert optimistic update
            setData(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: currentStatus } : t)
            }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="dashboard-loading">
            <Sparkles className="pulse" size={32} color="var(--edu-primary)" />
            <p>Initializing AI Cockpit...</p>
        </div>
    );

    const { profile, strength, stage, tasks } = data;
    const stageEnum = userStatus?.stage || STAGE_ID_MAP[stage] || 'ONBOARDING';
    const isOnboarding = stageEnum === 'ONBOARDING';
    const profileCompletion = userStatus?.profileCompletion || 0;

    return (
        <div className="dashboard-container">
            {/* Top Navigation */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <Globe size={20} />
                    <span>EduCompass AI</span>
                </div>
                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                    <Link to="/discovery" className="nav-link">Universities</Link>
                    <Link to="/tracker" className="nav-link">Applications</Link>
                </div>
                <ProfileMenu />
            </nav>

            <main className="dashboard-content">

                {/* Enhanced Stage Progress Tracker */}
                <StageProgressTracker currentStage={stageEnum} />

                {/* Onboarding Banner - Show if profile incomplete */}
                {isOnboarding && (
                    <div className="onboarding-banner">
                        <div className="onboarding-banner-text">
                            <AlertTriangle size={20} />
                            <span>Complete your profile to unlock AI recommendations and university matching.</span>
                        </div>
                        <Link to="/onboarding" className="onboarding-banner-cta">
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* 1. Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Hello, {profile?.name?.split(' ')[0] || 'Scholar'} 👋</h1>
                        <p className="subtitle">Here represents your AI Control Center.</p>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* SECTION A: Profile Summary */}
                    <div className="dash-card profile-summary">
                        <div className="card-header">
                            <h3><User size={18} /> Profile Snapshot</h3>
                            <Link to="/onboarding" className="edit-link">Edit</Link>
                        </div>
                        <div className="summary-list">
                            <div className="summary-item">
                                <label>Target Country</label>
                                <span>{profile.country}</span>
                            </div>
                            <div className="summary-item">
                                <label>Major Interest</label>
                                <span>{profile.major}</span>
                            </div>
                            <div className="summary-item">
                                <label>Budget Range</label>
                                <span>{profile.budget}</span>
                            </div>
                            <div className="summary-item">
                                <label>Current GPA</label>
                                <span>{profile.gpa}</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: Profile Strength */}
                    <div className="dash-card strength-card">
                        <div className="card-header">
                            <h3><TrendingUp size={18} /> Profile Strength</h3>
                        </div>
                        <div className="strength-display">
                            <div className={`strength-badge ${strength.label.toLowerCase()}`}>
                                {strength.label}
                            </div>
                            <div className="strength-bar-container">
                                <div className="strength-bar-fill" style={{ width: `${strength.score}%` }}></div>
                            </div>
                            <p className="strength-insight">
                                {strength.label === 'Strong'
                                    ? "Your profile is competitive! Ready for top universities."
                                    : "Complete more profile details to improve your admission chances."}
                            </p>
                        </div>
                    </div>

                    {/* SECTION C & D combined visually? No, D is distinct */}
                    {/* SECTION D: AI To-Do List */}
                    <div className="dash-card tasks-card">
                        <div className="card-header">
                            <h3><Sparkles size={18} /> AI Recommended Actions</h3>
                            <span className="ai-badge">Auto-Generated</span>
                        </div>

                        <div className="tasks-list">
                            {tasks.length === 0 ? (
                                <p className="empty-tasks">All caught up! Great work.</p>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className={`task-item ${task.status}`}>
                                        <div
                                            className="custom-checkbox"
                                            onClick={() => handleTaskToggle(task.id, task.status)}
                                        >
                                            {task.status === 'completed' && <CheckSquare size={16} />}
                                        </div>
                                        <div className="task-info">
                                            <h4>{task.title}</h4>
                                            <span className="task-cat">{task.description}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Access / Next Step Prompts */}
                    <div className="dash-card quick-actions">
                        <div className="card-header">
                            <h3>Next Steps</h3>
                        </div>
                        <div className="action-buttons">
                            {stage === 2 && (
                                <Link to="/discovery" className="action-btn primary">
                                    <Search size={16} /> Explore Universities
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                            {stage > 2 && (
                                <Link to="/tracker" className="action-btn primary">
                                    <Kanban size={16} /> Track Applications
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                            <Link to="/onboarding" className="action-btn secondary">
                                Update Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
};

export default Dashboard;
