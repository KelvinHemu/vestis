/**
 * React Query hooks for Shop data fetching and caching
 * 
 * This hook provides centralized shop data management with:
 * - 5 minute stale time to keep data fresh
 * - 30 minute garbage collection time
 * - Query key factory for consistent cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shopService';
import type { Shop, CreateShopRequest } from '@/types/shop';
import { toast } from 'sonner';

// ============================================================================
// Query Keys Factory
// ============================================================================
export const SHOP_KEYS = {
  all: ['shop'] as const,
  myShop: () => [...SHOP_KEYS.all, 'my-shop'] as const,
  details: () => [...SHOP_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...SHOP_KEYS.details(), slug] as const,
  items: () => [...SHOP_KEYS.all, 'items'] as const,
};

// ============================================================================
// Query Options
// ============================================================================
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch the current user's shop with caching
 */
export function useMyShop() {
  return useQuery<Shop | null, Error>({
    queryKey: SHOP_KEYS.myShop(),
    queryFn: () => shopService.getMyShop(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Create a new shop with optimistic updates
 */
export function useCreateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShopRequest) => shopService.createShop(data),
    onSuccess: (newShop) => {
      // Update the cache with the new shop
      queryClient.setQueryData(SHOP_KEYS.myShop(), newShop);
      toast.success("Shop created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Invalidate shop cache - useful after updates
 */
export function useInvalidateShop() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: SHOP_KEYS.all });
  };
}

export default useMyShop;
