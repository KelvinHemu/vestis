/**
 * React Query hooks for Models data fetching and caching
 * 
 * This hook provides centralized model data management with:
 * - 10 minute stale time to prevent excessive refetching
 * - 30 minute garbage collection time
 * - Query key factory for consistent cache management
 * - Hooks for fetching all models, single model, and models by gender
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import modelService from '@/services/modelService';
import type { Model, ModelsResponse } from '@/types/model';

// ============================================================================
// Query Keys Factory
// ============================================================================
export const MODEL_KEYS = {
  all: ['models'] as const,
  lists: () => [...MODEL_KEYS.all, 'list'] as const,
  list: (filters?: { gender?: string }) => [...MODEL_KEYS.lists(), filters] as const,
  details: () => [...MODEL_KEYS.all, 'detail'] as const,
  detail: (id: string | number | undefined) => [...MODEL_KEYS.details(), id] as const,
};

// ============================================================================
// Query Options
// ============================================================================
const STALE_TIME = 10 * 60 * 1000; // 10 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all models with caching
 */
export function useModels() {
  return useQuery<ModelsResponse, Error>({
    queryKey: MODEL_KEYS.lists(),
    queryFn: () => modelService.getModels(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Fetch a single model by ID with caching
 * Reuses data from the models list if available
 */
export function useModel(modelId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery<Model | undefined, Error>({
    queryKey: MODEL_KEYS.detail(modelId),
    queryFn: async () => {
      if (!modelId) return undefined;

      // First, try to get from the existing models cache
      const cachedModels = queryClient.getQueryData<ModelsResponse>(MODEL_KEYS.lists());
      if (cachedModels) {
        const cachedModel = cachedModels.models.find(m => m.id.toString() === modelId);
        if (cachedModel) return cachedModel;
      }

      // If not in cache, fetch all models and find the one we need
      const response = await modelService.getModels();
      return response.models.find(m => m.id.toString() === modelId);
    },
    enabled: !!modelId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Fetch models filtered by gender with caching
 * Useful for the ModelsPage and ModelSelector components
 */
export function useModelsByGender(gender?: string) {
  const { data, ...rest } = useModels();

  const filteredModels = data?.models.filter(model => {
    if (!gender || gender === 'All') return true;
    return model.gender.toLowerCase() === gender.toLowerCase();
  }) ?? [];

  return {
    ...rest,
    data: filteredModels,
    totalCount: data?.models.length ?? 0,
  };
}

/**
 * Hook to invalidate models cache
 * Useful after mutations that affect model data
 */
export function useInvalidateModels() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: MODEL_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: MODEL_KEYS.lists() }),
    invalidateModel: (id: string | number) => 
      queryClient.invalidateQueries({ queryKey: MODEL_KEYS.detail(id) }),
  };
}
