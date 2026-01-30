import api, { GOOGLE_AUTH_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowRight, Lock } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

                <button
                    type="button"
                    className="google-btn"
                    onClick={() => window.location.href = GOOGLE_AUTH_URL}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 4.36c1.6 0 3.06.56 4.23 1.68l3.18-3.18C17.46 1.12 14.96 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="divider">
                    <span>or continue with email</span>
                </div>

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
                        <label>Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
