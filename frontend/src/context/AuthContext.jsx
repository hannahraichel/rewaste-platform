import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
        if (token) {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get('/api/auth/profile');
                
                // If the backend has a nested .user object, extract it; otherwise, use the raw flat payload
                const cleanUserData = res.data.user ? res.data.user : res.data;
                setUser(cleanUserData);
            } catch (err) {
                console.error("Session expired or invalid token.");
                logout();
            }
        }
        setLoading(false);
    };
    fetchUserProfile();
}, [token]);

    const login = (userData, userToken) => {
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};