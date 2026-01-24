/**
 * React Query hooks for System Backgrounds
 * 
 * Provides data fetching and caching for system-provided backgrounds.
 * These are shared backgrounds available to all users.
 */

import { useQuery } from '@tanstack/react-query';
import backgroundService from '@/services/backgroundService';
import type { BackgroundsResponse } from '@/types/background';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const SYSTEM_BACKGROUND_KEYS = {
    all: ['system-backgrounds'] as const,
    lists: () => [...SYSTEM_BACKGROUND_KEYS.all, 'list'] as const,
    list: () => [...SYSTEM_BACKGROUND_KEYS.lists()] as const,
};

// ============================================================================
// Query Options
// ============================================================================

// 10 minute stale time - system backgrounds rarely change
const STALE_TIME = 10 * 60 * 1000;

// 30 minute garbage collection
const GC_TIME = 30 * 60 * 1000;

// ============================================================================
// Fetch Hooks
// ============================================================================

/**
 * Hook to fetch all system backgrounds
 */
export function useSystemBackgrounds() {
    return useQuery<BackgroundsResponse, Error>({
        queryKey: SYSTEM_BACKGROUND_KEYS.lists(),
        queryFn: () => backgroundService.getBackgrounds(),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        select: (data) => data,
    });
}

/**
 * Hook to get system backgrounds as an array (active only)
 */
export function useSystemBackgroundsList() {
    const { data, ...rest } = useSystemBackgrounds();

    return {
        ...rest,
        data: data?.backgrounds.filter(bg => bg.status === 'active') || [],
        count: data?.backgrounds.filter(bg => bg.status === 'active').length || 0,
    };
}
