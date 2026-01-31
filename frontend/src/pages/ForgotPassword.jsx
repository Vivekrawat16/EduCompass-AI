import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder logic for now
        setSubmitted(true);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Globe size={32} className="brand-icon" />
                    <span>EduCompass AI</span>
                </div>

                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive password reset instructions.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="auth-form">
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

                        <button type="submit" className="btn-primary-glow">
                            Send Reset Link <ArrowRight size={20} />
                        </button>
                    </form>
                ) : (
                    <div className="success-message" style={{ textAlign: 'center', padding: '1rem', background: '#ecfdf5', borderRadius: '8px', color: '#047857' }}>
                        <Mail size={40} style={{ margin: '0 auto 1rem', display: 'block', color: '#34d399' }} />
                        <h3>Check your inbox</h3>
                        <p style={{ fontSize: '0.9rem', color: '#065f46' }}>
                            We've sent password reset instructions to <strong>{email}</strong>.
                        </p>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="link-highlight" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
