import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Globe, User, GraduationCap, DollarSign, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import '../styles/Auth.css';

const Onboarding = () => {
    const { token, login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        target_country: '',
        target_major: '',
        gpa: '',
        budget: '',
        ielts: '',
        sat: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                test_scores: { ielts: formData.ielts, sat: formData.sat }
            };

            const response = await api.put('/profile', payload);
            const data = response.data;

            // Update local auth state with new stage (3 for completed onboarding?)
            login(token, data.stage);
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="auth-brand" style={{ marginBottom: '1rem' }}>
                        <Globe size={24} className="brand-icon" />
                        <span style={{ fontSize: '1.25rem' }}>EduCompass AI</span>
                    </div>
                    <h2>Build Your Profile</h2>
                    <p>
                        Our AI needs a few details to recommend the best universities and generate your personalized roadmap.
                    </p>
                </div>

                <div className="onboarding-steps">
                    <div className="step-indicator active"></div>
                    <div className="step-indicator active"></div>
                    <div className="step-indicator"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="onboarding-form-grid">
                        <div className="section-title">
                            <User size={20} className="brand-icon" />
                            Personal Details
                        </div>

                        <div className="form-group full-width">
                            <label className="input-label">Full Name</label>
                            <input
                                className="auth-input"
                                name="full_name"
                                placeholder="e.g. Alex Johnson"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="section-title">
                            <GraduationCap size={20} className="brand-icon" />
                            Academic Goals
                        </div>

                        <div className="form-group">
                            <label className="input-label">Target Major</label>
                            <input
                                className="auth-input"
                                name="target_major"
                                placeholder="e.g. Computer Science"
                                value={formData.target_major}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="input-label">Target Country</label>
                            <input
                                className="auth-input"
                                name="target_country"
                                placeholder="e.g. USA, UK, Canada"
                                value={formData.target_country}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="input-label">Current GPA</label>
                            <input
                                className="auth-input"
                                name="gpa"
                                placeholder="e.g. 3.8"
                                value={formData.gpa}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="input-label">Annual Budget</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    className="auth-input"
                                    name="budget"
                                    placeholder="e.g. 50000"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '2.5rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="section-title">
                            <BookOpen size={20} className="brand-icon" />
                            Test Scores (Optional)
                        </div>

                        <div className="form-group">
                            <label className="input-label">IELTS / TOEFL</label>
                            <input
                                className="auth-input"
                                name="ielts"
                                placeholder="e.g. 7.5"
                                value={formData.ielts}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="input-label">SAT / GRE</label>
                            <input
                                className="auth-input"
                                name="sat"
                                placeholder="e.g. 1450"
                                value={formData.sat}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-primary-glow" style={{ width: 'auto', padding: '1rem 2.5rem' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : (
                                <>
                                    Complete Profile <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
