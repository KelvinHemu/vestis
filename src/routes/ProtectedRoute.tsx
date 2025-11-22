import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

/**
 * ProtectedRoute component that renders children only if user is authenticated
 * If user is not authenticated, displays login form
 * If user lacks required role, displays access denied message
 */
export function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();

  // Check if there are OAuth tokens in the URL hash
  const hash = window.location.hash.substring(1);
  const hasOAuthTokens = hash && hash.includes('access_token=');

  // Wait for auth initialization
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Allow access if OAuth tokens are present (they will be processed by the component)
  if (!isAuthenticated && !hasOAuthTokens) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>You don't have permission to access this page.</p>
            <p>Required role: <strong className="text-foreground">{requiredRole}</strong></p>
            <p>Your role: <strong className="text-foreground">{user?.role || 'user'}</strong></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
