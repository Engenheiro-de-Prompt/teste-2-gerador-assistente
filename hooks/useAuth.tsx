
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('chat-proxy-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((email: string) => {
        // In a real app, this would involve a password and a call to a backend.
        // Here, we simulate it by creating a user object and saving it.
        const newUser: User = { id: `user_${new Date().getTime()}`, email };
        localStorage.setItem('chat-proxy-user', JSON.stringify(newUser));
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('chat-proxy-user');
        // Also clear assistants for the logged out user
        localStorage.removeItem('chat-proxy-assistants');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
