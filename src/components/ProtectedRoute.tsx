import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login with the current path as the redirect target
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;