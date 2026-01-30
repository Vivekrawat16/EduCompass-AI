import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const stage = searchParams.get('stage');

        if (token) {
            // Log the user in
            login(token, stage);

            // Redirect logic based on profile completion/stage
            if (stage && parseInt(stage) > 1) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } else {
            // Failed
            navigate('/login?error=Google_Auth_Failed');
        }
    }, [searchParams, login, navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-obsidian)',
            color: '#fff'
        }}>
            <Loader2 className="animate-spin" size={48} color="var(--neon-violet)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Authenticating...</p>
        </div>
    );
};

export default GoogleCallback;
