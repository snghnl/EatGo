import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthUtils } from '@/src/utils/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (tokens: { access: string; refresh: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    // Check authentication status on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Handle navigation based on auth status
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'onboarding';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to onboarding if not authenticated
            router.replace('/onboarding');
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect to main app if authenticated
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isLoading, segments]);

    const checkAuthStatus = async () => {
        try {
            const authenticated = await AuthUtils.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (tokens: { access: string; refresh: string }) => {
        try {
            await AuthUtils.setTokens(tokens);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthUtils.clearTokens();
            setIsAuthenticated(false);
            router.replace('/onboarding');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
