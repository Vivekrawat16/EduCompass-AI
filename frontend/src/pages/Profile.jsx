import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, GraduationCap, Globe, DollarSign, Calendar,
    BookOpen, Award, TrendingUp, ArrowLeft, Edit, Save, X, Briefcase, FileText, Sparkles, BrainCircuit
} from 'lucide-react';
import ProfileMenu from '../components/ProfileMenu';
import api from '../utils/api';
import '../styles/Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Get user auth details
            const authRes = await api.get('/auth/me');
            const authData = authRes.data;

            // Get profile details
            const profileRes = await api.get('/profile');
            const profileData = profileRes.data;

            // Combine data
            const fullProfile = {
                user: authData.user,
                details: profileData
            };

            setProfile(fullProfile);
            setFormData(profileData); // Initialize form data
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/profile', formData);
            const updatedData = res.data;
            setProfile(prev => ({ ...prev, details: updatedData.profile }));
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    if (loading) return <div className="profile-loading">Loading Profile...</div>;

    const isHighSchool = formData.education_level === "High School";

    return (
        <div className="profile-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <Globe size={24} className="brand-icon" />
                    <span>EduCompass AI</span>
                </div>
                <ProfileMenu />
            </nav>

            <div className="profile-content">
                <div className="profile-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1>My Profile</h1>

                    {isEditing ? (
                        <div className="edit-actions">
                            <button className="cancel-btn" onClick={() => {
                                setIsEditing(false);
                                setFormData(profile?.details || {}); // Reset
                            }}>
                                <X size={18} /> Cancel
                            </button>
                            <button className="save-btn" onClick={handleSave}>
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                            <Edit size={18} />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>

                <div className="profile-grid">
                    {/* Personal Info Card */}
                    <motion.div className="glass-card profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-large">
                                {profile?.details?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <div className="profile-info">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name || ''}
                                        onChange={handleInputChange}
                                        className="edit-input-large"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2>{profile?.details?.full_name || 'Student'}</h2>
                                )}
                                <p className="profile-email">
                                    <Mail size={16} />
                                    {profile?.user?.email || 'Not set'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Academic Information */}
                    <motion.div className="glass-card details-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h3 className="card-section-title">
                            <GraduationCap size={20} /> Academic Background
                        </h3>
                        <div className="details-grid">
                            <ProfileField
                                label="Education Level"
                                name="education_level"
                                icon={<BookOpen size={18} />}
                                value={formData.education_level}
                                onChange={handleInputChange}
                                isEditing={isEditing}
                                options={["High School", "Bachelor's", "Master's", "PhD"]}
                            />

                            {isHighSchool ? (
                                <>
                                    <ProfileField label="School Board" name="school_board" icon={<Award size={18} />} value={formData.school_board} onChange={handleInputChange} isEditing={isEditing} options={["CBSE", "ICSE", "IB", "State Board", "Other"]} />
                                    <ProfileField label="Percentage / GPA" name="gpa" icon={<TrendingUp size={18} />} value={formData.gpa} onChange={handleInputChange} isEditing={isEditing} />
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Current Major" name="degree_major" icon={<Award size={18} />} value={formData.degree_major} onChange={handleInputChange} isEditing={isEditing} options={["Computer Science", "Engineering", "Business Administration", "Commerce", "Arts & Humanities", "Medical / Health", "Law", "Social Sciences", "Other"]} />
                                    <ProfileField label="GPA / CGPA" name="gpa" icon={<TrendingUp size={18} />} value={formData.gpa} onChange={handleInputChange} isEditing={isEditing} />
                                </>
                            )}

                            <ProfileField label={isHighSchool ? "Completion Year" : "Graduation Year"} name="graduation_year" icon={<Calendar size={18} />} value={formData.graduation_year} onChange={handleInputChange} isEditing={isEditing} type="number" />
                        </div>
                    </motion.div>

                    {/* Study Goals */}
                    <motion.div className="glass-card details-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 className="card-section-title">
                            <Globe size={20} /> Study Goals
                        </h3>
                        <div className="details-grid">
                            <ProfileField label="Target Degree" name="target_degree" icon={<BookOpen size={18} />} value={formData.target_degree} onChange={handleInputChange} isEditing={isEditing} options={["Bachelor's", "Master's", "PhD"]} />
                            <ProfileField label="Target Major" name="target_major" icon={<Award size={18} />} value={formData.target_major} onChange={handleInputChange} isEditing={isEditing} options={["Computer Science", "Data Science", "Artificial Intelligence", "MBA / Management", "Engineering", "Medicine", "Psychology", "Law", "Fine Arts"]} />
                            <ProfileField label="Target Country" name="target_country" icon={<Globe size={18} />} value={formData.target_country} onChange={handleInputChange} isEditing={isEditing} options={["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Ireland", "New Zealand", "Singapore", "Japan", "South Korea", "Switzerland", "Italy", "Spain"]} />
                            <ProfileField label="Budget" name="budget" icon={<DollarSign size={18} />} value={formData.budget} onChange={handleInputChange} isEditing={isEditing} options={["<$20k", "$20k-$40k", "$40k-$60k", "$60k+"]} />
                            <ProfileField label="Funding Type" name="funding_type" icon={<DollarSign size={18} />} value={formData.funding_type} onChange={handleInputChange} isEditing={isEditing} options={["Self-funded", "Scholarship", "Optimization"]} />
                        </div>
                    </motion.div>

                    {/* Test Scores & Experience */}
                    <motion.div className="glass-card details-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="card-section-title">
                            <FileText size={20} /> Scores & Experience
                        </h3>
                        <div className="details-grid">
                            <ProfileField label="IELTS/TOEFL" name="ielts_score" icon={<FileText size={18} />} value={formData.ielts_score} onChange={handleInputChange} isEditing={isEditing} />

                            {isHighSchool ? (
                                <>
                                    <ProfileField label="SAT Score" name="sat_score" icon={<FileText size={18} />} value={formData.sat_score} onChange={handleInputChange} isEditing={isEditing} options={["Not Taken", "< 1200", "1200-1400", "1400+"]} />
                                    <ProfileField label="ACT Score" name="act_score" icon={<FileText size={18} />} value={formData.act_score} onChange={handleInputChange} isEditing={isEditing} options={["Not Taken", "< 25", "25-30", "30+"]} />
                                </>
                            ) : (
                                <>
                                    <ProfileField label="GRE/GMAT" name="gre_score" icon={<FileText size={18} />} value={formData.gre_score} onChange={handleInputChange} isEditing={isEditing} />
                                    <ProfileField label="Work Experience" name="work_experience" icon={<Briefcase size={18} />} value={formData.work_experience} onChange={handleInputChange} isEditing={isEditing} />
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Personal Insights (NEW) */}
                    <motion.div className="glass-card details-card full-width-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h3 className="card-section-title">
                            <Sparkles size={20} /> Personal Insights
                        </h3>
                        <div className="details-grid">
                            <ProfileField label="Career Aspirations" name="career_aspirations" icon={<TrendingUp size={18} />} value={formData.career_aspirations} onChange={handleInputChange} isEditing={isEditing} options={["Software Engineer", "Data Scientist", "Product Manager", "Entrepreneur", "Researcher / Academic", "Civil Services", "Management Consultant", "Investment Banker", "Digital Marketer", "Creative Artist / Designer", "Healthcare Professional", "Legal Professional"]} />
                            <ProfileField label="Primary Language" name="languages_known" icon={<Globe size={18} />} value={formData.languages_known} onChange={handleInputChange} isEditing={isEditing} options={["English", "Spanish", "French", "German", "Mandarin", "Hindi", "Arabic", "Portuguese", "Japanese", "Russian", "Korean"]} />
                            <ProfileField label="Learning Style" name="learning_style" icon={<BrainCircuit size={18} />} value={formData.learning_style} onChange={handleInputChange} isEditing={isEditing} options={["Visual", "Auditory", "Kinesthetic", "Reading/Writing"]} />
                            <ProfileField label="Preferred University Type" name="preferred_university_type" icon={<BookOpen size={18} />} value={formData.preferred_university_type} onChange={handleInputChange} isEditing={isEditing} options={["Public", "Private", "Research", "Liberal Arts"]} />

                            {/* Extracurriculars - using inline rendering or simple logic for now as it doesn't need custom state hooks like ProfileField inside */}
                            <div className="detail-item full-width">
                                <div className="detail-icon"><Sparkles size={18} /></div>
                                <div className="detail-content">
                                    <span className="detail-label">Extracurricular Activities</span>
                                    {isEditing ? (
                                        <textarea
                                            name="extracurricular_activities"
                                            value={formData.extracurricular_activities || ''}
                                            onChange={handleInputChange}
                                            className="edit-input textarea-input styled-textarea"
                                            placeholder="Enter Extracurricular Activities"
                                            rows={3}
                                        />
                                    ) : (
                                        <span className="detail-value">{formData.extracurricular_activities || <span className="placeholder-text">Not set</span>}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Other Info */}
                    <motion.div className="glass-card details-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <h3 className="card-section-title">
                            <TrendingUp size={20} /> Other Info
                        </h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <div className="detail-icon"><Calendar size={18} /></div>
                                <div className="detail-content">
                                    <span className="detail-label">Joined On</span>
                                    <span className="detail-value">
                                        {profile?.user?.created_at ? new Date(profile.user.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><User size={18} /></div>
                                <div className="detail-content">
                                    <span className="detail-label">User ID</span>
                                    <span className="detail-value code-font">
                                        {profile?.user?.id ? String(profile.user.id).substring(0, 8) : '...'}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// Extracted Component to correctly use hooks
const ProfileField = ({ label, name, icon, value, onChange, isEditing, type = "text", options = null }) => {
    // Hooks must be at the top level of the component
    const [showCustom, setShowCustom] = useState(false);

    useEffect(() => {
        if (options && value && !options.includes(value)) {
            setShowCustom(true);
        } else {
            // Reset if value matches an option or is empty
            setShowCustom(false);
        }
    }, [value, options, isEditing]);

    const handleSelectChange = (e) => {
        if (e.target.value === "Other") {
            setShowCustom(true);
            onChange({ target: { name, value: "" } });
        } else {
            setShowCustom(false);
            onChange(e);
        }
    };

    return (
        <div className="detail-item">
            <div className="detail-icon">{icon}</div>
            <div className="detail-content">
                <span className="detail-label">{label}</span>
                {isEditing ? (
                    options ? (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <select
                                name={name}
                                value={showCustom ? "Other" : (options.includes(value) ? value : (value ? "Other" : ""))}
                                onChange={handleSelectChange}
                                className="edit-input"
                            >
                                <option value="">Select...</option>
                                {options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                                <option value="Other">Other (Type manually)</option>
                            </select>
                            {showCustom && (
                                <input
                                    type="text"
                                    name={name}
                                    value={value || ''}
                                    onChange={onChange}
                                    className="edit-input"
                                    placeholder={`Enter ${label}`}
                                    style={{ marginTop: '5px' }}
                                    autoFocus
                                />
                            )}
                        </div>
                    ) : (
                        <input
                            type={type}
                            name={name}
                            value={value || ''}
                            onChange={onChange}
                            className="edit-input"
                            placeholder={`Enter ${label}`}
                        />
                    )
                ) : (
                    <span className="detail-value">{value || <span className="placeholder-text">Not set</span>}</span>
                )}
            </div>
        </div>
    );
};

export default Profile;
