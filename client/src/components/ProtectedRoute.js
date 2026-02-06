import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        // You might want to render a loading spinner here
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && (!user || !user.roles || !allowedRoles.some(role => user.roles.includes(role)))) {
        // User is authenticated but doesn't have permissions
        // Redirect to their appropriate dashboard or home
        if (user.roles.includes('farmer')) {
            return <Navigate to="/farmer/dashboard" replace />;
        } else if (user.roles.includes('customer')) {
            return <Navigate to="/customer/products" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
