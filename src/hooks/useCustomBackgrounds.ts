/**
 * React Query hooks for Custom Backgrounds
 * 
 * Provides data fetching, caching, and mutations for user-uploaded backgrounds.
 * Custom backgrounds are private to each user.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customBackgroundService from '@/services/customBackgroundService';
import type { CustomBackground, CustomBackgroundsResponse, CreateCustomBackgroundInput } from '@/types/customBackground';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const CUSTOM_BACKGROUND_KEYS = {
    all: ['custom-backgrounds'] as const,
    lists: () => [...CUSTOM_BACKGROUND_KEYS.all, 'list'] as const,
    list: () => [...CUSTOM_BACKGROUND_KEYS.lists()] as const,
    detail: (id: number) => [...CUSTOM_BACKGROUND_KEYS.all, 'detail', id] as const,
};

// ============================================================================
// Query Options
// ============================================================================

// 5 minute stale time - backgrounds don't change often
const STALE_TIME = 5 * 60 * 1000;

// 15 minute garbage collection
const GC_TIME = 15 * 60 * 1000;

// ============================================================================
// Fetch Hooks
// ============================================================================

/**
 * Hook to fetch all custom backgrounds for the current user
 */
export function useCustomBackgrounds() {
    return useQuery<CustomBackgroundsResponse, Error>({
        queryKey: CUSTOM_BACKGROUND_KEYS.lists(),
        queryFn: () => customBackgroundService.getCustomBackgrounds(),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        select: (data) => data,
    });
}

/**
 * Hook to get custom backgrounds as an array
 */
export function useCustomBackgroundsList() {
    const { data, ...rest } = useCustomBackgrounds();

    return {
        ...rest,
        data: data?.backgrounds || [],
        count: data?.count || 0,
    };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new custom background
 * Automatically invalidates the custom backgrounds list on success
 */
export function useCreateCustomBackground() {
    const queryClient = useQueryClient();

    return useMutation<CustomBackground, Error, CreateCustomBackgroundInput>({
        mutationFn: (data) => customBackgroundService.createCustomBackground(data),
        onSuccess: () => {
            // Invalidate and refetch custom backgrounds list
            queryClient.invalidateQueries({ queryKey: CUSTOM_BACKGROUND_KEYS.all });
        },
    });
}

/**
 * Hook to delete a custom background
 * Automatically invalidates the custom backgrounds list on success
 */
export function useDeleteCustomBackground() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (backgroundId) => customBackgroundService.deleteCustomBackground(backgroundId),
        onSuccess: () => {
            // Invalidate and refetch custom backgrounds list
            queryClient.invalidateQueries({ queryKey: CUSTOM_BACKGROUND_KEYS.all });
        },
    });
}

/**
 * Hook to manually invalidate custom backgrounds cache
 */
export function useInvalidateCustomBackgrounds() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: CUSTOM_BACKGROUND_KEYS.all });
    };
}
