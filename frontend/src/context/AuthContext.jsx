import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState(1);

    // Check strict auth status
    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setStage(response.data.stage || 1);
            } else {
                setIsAuthenticated(false);
            }
        } catch (err) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token, newStage) => {
        setIsAuthenticated(true);
        setStage(newStage);
        // We don't need to store token in localStorage as we use HTTP-only cookies
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
            setStage(1);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const advanceStage = (newStage) => {
        if (newStage > stage) {
            setStage(newStage);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, stage, advanceStage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
