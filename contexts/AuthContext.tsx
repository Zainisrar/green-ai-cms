'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
        permissions: Record<string, any>;
    } | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, authToken: string) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/boxed-signin'];

    useEffect(() => {
        // Check for existing authentication on mount
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setToken(storedToken);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Redirect logic after loading is complete
        if (!isLoading) {
            const isPublicRoute = publicRoutes.includes(pathname);
            const isAuthenticated = user && token;

            if (!isAuthenticated && !isPublicRoute) {
                // Not authenticated and trying to access protected route
                router.push('/auth/login');
            } else if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/boxed-signin')) {
                // Authenticated but on login page, redirect to navigation
                router.push('/');
            }
        }
    }, [user, token, isLoading, pathname, router]);

    const login = (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    };

    const logout = async () => {
        try {
            // Call logout API to invalidate session
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local state and storage regardless of API call result
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/auth/login');
        }
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!(user && token),
    };

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};