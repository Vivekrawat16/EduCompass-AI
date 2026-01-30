import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userStage, setUserStage] = useState(1);

    // Check strict auth status
    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setUserStage(response.data.user.current_stage_id || 1);
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

    const login = (token, stage) => {
        setIsAuthenticated(true);
        setUserStage(stage);
        // We don't need to store token in localStorage as we use HTTP-only cookies
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
            setUserStage(1);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const advanceStage = (newStage) => {
        if (newStage > userStage) {
            setUserStage(newStage);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, userStage, advanceStage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
