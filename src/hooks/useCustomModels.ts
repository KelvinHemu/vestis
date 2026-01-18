/**
 * React Query hooks for Custom Models
 * 
 * Provides data fetching, caching, and mutations for business-specific custom models.
 * Custom models are private to each business and only visible to them.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customModelService from '@/services/customModelService';
import type { CustomModel, CreateCustomModelRequest, CustomModelsResponse } from '@/types/model';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const CUSTOM_MODEL_KEYS = {
  all: ['custom-models'] as const,
  lists: () => [...CUSTOM_MODEL_KEYS.all, 'list'] as const,
  list: (filters?: { gender?: string }) => [...CUSTOM_MODEL_KEYS.lists(), filters] as const,
};

// ============================================================================
// Query Options
// ============================================================================

// 5 minute stale time - custom models don't change often
const STALE_TIME = 5 * 60 * 1000;

// 15 minute garbage collection
const GC_TIME = 15 * 60 * 1000;

// ============================================================================
// Fetch Hooks
// ============================================================================

/**
 * Hook to fetch all custom models for the current business
 */
export function useCustomModels() {
  return useQuery<CustomModelsResponse, Error>({
    queryKey: CUSTOM_MODEL_KEYS.lists(),
    queryFn: () => customModelService.getCustomModels(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    // Return empty array if fetch fails (e.g., 404 means no custom models yet)
    select: (data) => data,
  });
}

/**
 * Hook to fetch custom models filtered by gender
 */
export function useCustomModelsByGender(gender?: 'male' | 'female') {
  const { data, ...rest } = useCustomModels();
  
  // Filter models by gender if specified
  const filteredModels = gender 
    ? (data?.models || []).filter(model => model.gender === gender)
    : (data?.models || []);
  
  return {
    ...rest,
    data: filteredModels,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a new custom model
 * Automatically invalidates the custom models list on success
 */
export function useCreateCustomModel() {
  const queryClient = useQueryClient();
  
  return useMutation<CustomModel, Error, CreateCustomModelRequest>({
    mutationFn: (data) => customModelService.createCustomModel(data),
    onSuccess: () => {
      // Invalidate and refetch custom models list
      queryClient.invalidateQueries({ queryKey: CUSTOM_MODEL_KEYS.all });
    },
  });
}

/**
 * Hook to delete a custom model
 * Automatically invalidates the custom models list on success
 */
export function useDeleteCustomModel() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (modelId) => customModelService.deleteCustomModel(modelId),
    onSuccess: () => {
      // Invalidate and refetch custom models list
      queryClient.invalidateQueries({ queryKey: CUSTOM_MODEL_KEYS.all });
    },
  });
}

/**
 * Hook to update a custom model
 */
export function useUpdateCustomModel() {
  const queryClient = useQueryClient();
  
  return useMutation<CustomModel, Error, { id: number; data: Partial<CreateCustomModelRequest> }>({
    mutationFn: ({ id, data }) => customModelService.updateCustomModel(id, data),
    onSuccess: () => {
      // Invalidate and refetch custom models list
      queryClient.invalidateQueries({ queryKey: CUSTOM_MODEL_KEYS.all });
    },
  });
}

/**
 * Hook to manually invalidate custom models cache
 * Useful when you need to refresh the list from external actions
 */
export function useInvalidateCustomModels() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: CUSTOM_MODEL_KEYS.all });
  };
}


