import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/contexts/authStore';
import userService from '@/services/userService';
import authService from '@/services/authService';
import type { User } from '@/types/user';
import { logger } from '@/utils/logger';

/**
 * Query key for user data
 * Exported for use in invalidation across the app
 */
export const USER_QUERY_KEY = ['user'] as const;

/**
 * Hook for fetching current user data with TanStack Query
 * Provides caching, automatic refetching, and reactive updates
 * 
 * Uses the user from auth store as initial data so credits are
 * available immediately after login without waiting for a fetch.
 * 
 * Automatically redirects to login if authentication fails completely.
 * 
 * Use this instead of manual useEffect + useState patterns
 */
export function useUser() {
    const router = useRouter();
    const { token, isAuthenticated, user: authUser, logout } = useAuthStore();
    const hasRedirected = useRef(false);

    // Redirect immediately if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !token && !hasRedirected.current && typeof window !== 'undefined') {
            // Check if we're on a protected route
            const isProtectedRoute = window.location.pathname.startsWith('/dashboard') || 
                                   window.location.pathname.startsWith('/create') ||
                                   window.location.pathname.startsWith('/history') ||
                                   window.location.pathname.startsWith('/pricing');
            
            if (isProtectedRoute && !hasRedirected.current) {
                hasRedirected.current = true;
                logger.warn('🔒 No authentication detected, redirecting to login...');
                router.replace('/login');
            }
        }
    }, [isAuthenticated, token, router]);

    const query = useQuery<User | null, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: async () => {
            if (!token) return null;
            const response = await userService.getCurrentUser(token);
            return response.user;
        },
        // Only fetch when authenticated with a token
        enabled: isAuthenticated && !!token && !hasRedirected.current,
        // Keep data fresh - shorter stale time for credits accuracy
        staleTime: 30 * 1000, // 30 seconds
        // Cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Always refetch on mount to ensure fresh data (especially credits)
        refetchOnMount: true,
        // Refetch when window regains focus
        refetchOnWindowFocus: true,
        // Use auth store user as initial data so credits are immediately available
        // This is especially important after login when credits come from the login response
        initialData: authUser as User | null,
        // Disable automatic retries for auth errors to prevent multiple failed requests
        retry: (failureCount, error: any) => {
            // Don't retry on authentication errors
            if (error?.status === 401 || error?.message?.includes('Authentication failed')) {
                return false;
            }
            // Retry other errors up to 2 times
            return failureCount < 2;
        },
    });

    // Handle authentication errors with useEffect for reliable redirect
    useEffect(() => {
        if (query.error && !hasRedirected.current) {
            const error = query.error as any;
            // Check if this is an authentication error (401)
            if (error?.status === 401 || error?.message?.includes('Authentication failed') || error?.message?.includes('Session expired')) {
                hasRedirected.current = true;
                logger.warn('🔒 Authentication failed completely, redirecting to login...');
                
                // Clear auth state immediately
                authService.logout();
                logout();
                
                // Use window.location for hard redirect to ensure clean state
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
    }, [query.error, logout, router]);

    return query;
}

/**
 * Hook for getting just the user's credits
 * Derives from useUser query to avoid duplicate fetches
 */
export function useCredits() {
    const { data: user, isLoading, error } = useUser();

    return {
        credits: user?.credits ?? 0,
        isLoading,
        error,
    };
}

/**
 * Hook to invalidate user cache
 * Call this after any operation that changes credits (generation, payment, etc.)
 */
export function useInvalidateUser() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    };
}

/**
 * Utility to invalidate user query from outside React components
 * Use sparingly - prefer useInvalidateUser hook when possible
 */
export function invalidateUserQuery(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
}
