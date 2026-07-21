'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: {
        resource: string;
        action: 'view' | 'edit' | 'delete';
    };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredPermission 
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // AuthContext will handle redirect
    }

    // Check permissions if required
    if (requiredPermission && user) {
        const { resource, action } = requiredPermission;
        
        // Super admin (admin role) has all permissions
        if (user.role?.name === 'admin') {
            return <>{children}</>;
        }

        // Check specific permissions
        const permissions = user.role?.permissions;
        if (!permissions || !permissions[resource] || !permissions[resource][action]) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;