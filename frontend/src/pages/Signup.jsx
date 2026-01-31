import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowRight, Lock, Check, Sparkles } from 'lucide-react';
import '../styles/Auth.css';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', {
                full_name: fullName,
                email,
                password
            });

            const data = response.data;
            login(data.token, 1); // Stage 1: Auth Done
            navigate('/onboarding'); // Go to Profile Setup

        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Globe size={32} className="brand-icon" />
                    <span>EduCompass AI</span>
                </div>

                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Start your journey to your dream university today.</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Create Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary-glow" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : (
                            <>
                                Get Started <Sparkles size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login" className="link-highlight">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
