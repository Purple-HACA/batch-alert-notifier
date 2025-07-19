import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/auth'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (user && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};