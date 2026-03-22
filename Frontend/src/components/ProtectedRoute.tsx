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

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if unauthorized
        if (user.role === 'BUYER') return <Navigate to="/dashboard/buyer" replace />;
        if (user.role === 'SELLER') return <Navigate to="/dashboard/seller" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
