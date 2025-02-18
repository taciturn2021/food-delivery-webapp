import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (!token) {
                setLoading(false);
                return;
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            try {
                const response = await getProfile();
                const userData = response.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []); // Only run on mount

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            isAdmin: user?.role === 'admin',
            isBranch: user?.role === 'branch_manager',
            isRider: user?.role === 'rider'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};