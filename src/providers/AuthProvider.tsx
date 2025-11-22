import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from '../contexts/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that initializes authentication on app load
 * Should wrap your entire app in main.tsx
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
