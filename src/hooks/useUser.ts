import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/contexts/authStore';
import userService from '@/services/userService';
import type { User } from '@/types/user';

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
 * Use this instead of manual useEffect + useState patterns
 */
export function useUser() {
    const { token, isAuthenticated, user: authUser } = useAuthStore();

    return useQuery<User | null, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: async () => {
            if (!token) return null;
            const response = await userService.getCurrentUser(token);
            return response.user;
        },
        // Only fetch when authenticated with a token
        enabled: isAuthenticated && !!token,
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
    });
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
