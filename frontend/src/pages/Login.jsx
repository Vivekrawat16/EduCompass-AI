import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });

            // Axios returns data directly in response.data
            const data = response.data;
            login(data.token, data.stage);
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your personalized study abroad journey.</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
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
                        <div className="label-row">
                            <label>Password</label>
                            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                        </div>
                        <div className="input-wrapper">
                            <input
                                className="auth-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-glow" disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>New to EduCompass?</span>
                    <Link to="/signup" className="link-highlight">Create a free account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
