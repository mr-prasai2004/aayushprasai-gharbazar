import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('currentUser');
    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Normalize role to uppercase for comparison
    const userRole = user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles?.map((role: string) => role.toUpperCase());

    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if unauthorized
        if (userRole === 'BUYER') return <Navigate to="/dashboard/buyer" replace />;
        if (userRole === 'SELLER') return <Navigate to="/dashboard/seller" replace />;
        if (userRole === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
