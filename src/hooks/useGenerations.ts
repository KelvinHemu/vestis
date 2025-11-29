import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generationService } from '../services/generationService';
import type { Generation, GenerationListResponse } from '../types/generation';

const GENERATIONS_QUERY_KEY = ['generations'] as const;
const PAGE_SIZE = 20;

/**
 * Hook for fetching paginated generations with caching
 * Data is cached and won't refetch on every navigation unless stale
 */
export function useGenerations() {
  return useInfiniteQuery<GenerationListResponse, Error>({
    queryKey: GENERATIONS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      return generationService.list(pageParam as number, PAGE_SIZE);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.metadata) return undefined;
      const { current_page, page_size, total_records } = lastPage.metadata;
      const totalPages = Math.ceil(total_records / page_size);
      return current_page < totalPages ? current_page + 1 : undefined;
    },
    // Keep previous data while fetching new pages
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for deleting a generation with optimistic updates
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => generationService.delete(id),
    // Optimistically remove from cache before server confirms
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: GENERATIONS_QUERY_KEY });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(GENERATIONS_QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<{
        pages: GenerationListResponse[];
        pageParams: number[];
      }>(GENERATIONS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            generations: page.generations.filter((gen) => gen.id !== deletedId),
          })),
        };
      });

      return { previousData };
    },
    // If mutation fails, rollback to previous data
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(GENERATIONS_QUERY_KEY, context.previousData);
      }
    },
    // Always refetch after error or success to ensure sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GENERATIONS_QUERY_KEY });
    },
  });
}

/**
 * Utility to get flattened generations from infinite query data
 */
export function flattenGenerations(
  data: { pages: GenerationListResponse[] } | undefined
): Generation[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.generations || []);
}

/**
 * Hook to manually invalidate generations cache
 * Use this after creating new generations to force refetch
 */
export function useInvalidateGenerations() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: GENERATIONS_QUERY_KEY });
  };
}
