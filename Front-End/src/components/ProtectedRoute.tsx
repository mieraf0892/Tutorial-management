// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'tutor' | 'admin' | 'super_admin' | 'staff';
  adminOnly?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  adminOnly = false,
  fallback = <div>Access Denied</div>,
}) => {
  const { isAuthenticated, user, hasRole, canAccessAdmin, isLoading } = useAuth();

  // ✅ Check localStorage directly as fallback
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // If useAuth hasn't initialized yet but we have tokens, consider authenticated
  const isReallyAuthenticated = isAuthenticated || (token && userData);

  // Show loading while auth state is initializing
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isReallyAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Parse user data from localStorage if useAuth user is null
  const currentUser = user || (userData ? JSON.parse(userData) : null);

  if (adminOnly && !canAccessAdmin()) {
    return <>{fallback}</>;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;