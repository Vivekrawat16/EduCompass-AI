import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stage, setStage] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                method: 'GET',
                credentials: 'include' // Send cookie
            });

            const parseRes = await response.json();

            if (parseRes.isAuthenticated) {
                setIsAuthenticated(true);
                setStage(parseRes.stage);
            } else {
                setIsAuthenticated(false);
                setStage(null);
            }
        } catch (err) {
            console.error(err);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = (token, userStage) => {
        // Token is set in cookie by backend, we just update state
        // The 'token' argument is kept for compatibility but not used for storage
        setIsAuthenticated(true);
        setStage(userStage);
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            setIsAuthenticated(false);
            setStage(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Simple loading state
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, stage, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
