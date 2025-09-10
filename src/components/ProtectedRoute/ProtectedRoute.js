import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    // We no longer need a loading check here because the AuthProvider
    // won't render its children until the initial auth check is complete.
    // This simplifies our protected route logic significantly.

    if (!currentUser) {
        // If the auth check is done and there's still no user, redirect.
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;

