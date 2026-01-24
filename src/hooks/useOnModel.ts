import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onModelPhotosService } from '../services/onModelPhotosService';
import type { 
  OnModelHistory, 
  OnModelHistoryResponse,
  GenerateOnModelRequest,
  GenerateOnModelResponse,
} from '../types/onModel';
import { InsufficientCreditsError } from '../types/errors';
import { CREDITS_QUERY_KEY } from './useUser';

// Query keys
export const ONMODEL_KEYS = {
  all: ['onmodel'] as const,
  history: () => [...ONMODEL_KEYS.all, 'history'] as const,
  detail: (id: string) => [...ONMODEL_KEYS.all, 'detail', id] as const,
};

const PAGE_SIZE = 20;

/**
 * Hook for fetching paginated on-model history with caching
 * Data is cached and won't refetch on every navigation unless stale
 */
export function useOnModelHistory() {
  return useInfiniteQuery<OnModelHistoryResponse, Error>({
    queryKey: ONMODEL_KEYS.history(),
    queryFn: async ({ pageParam }) => {
      const offset = ((pageParam as number) - 1) * PAGE_SIZE;
      return onModelPhotosService.getHistory(PAGE_SIZE, offset);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.history.length, 0);
      return totalFetched < lastPage.count ? allPages.length + 1 : undefined;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching a single on-model by ID
 */
export function useOnModelDetail(id: string) {
  return useInfiniteQuery<OnModelHistory, Error>({
    queryKey: ONMODEL_KEYS.detail(id),
    queryFn: () => onModelPhotosService.getOnModelById(id),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!id,
  });
}

/**
 * Hook for generating on-model photos with cache invalidation
 */
export function useOnModelGenerate() {
  const queryClient = useQueryClient();

  return useMutation<GenerateOnModelResponse, Error | InsufficientCreditsError, GenerateOnModelRequest>({
    mutationFn: (request) => onModelPhotosService.generateOnModel(request),
    onSuccess: () => {
      // Invalidate history cache to include new generation
      queryClient.invalidateQueries({ queryKey: ONMODEL_KEYS.history() });
      // Invalidate credits query to refresh balance after generation
      queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting an on-model with optimistic updates
 */
export function useDeleteOnModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => onModelPhotosService.deleteOnModel(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ONMODEL_KEYS.history() });
      const previousData = queryClient.getQueryData(ONMODEL_KEYS.history());

      queryClient.setQueryData<{
        pages: OnModelHistoryResponse[];
        pageParams: number[];
      }>(ONMODEL_KEYS.history(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            history: page.history.filter((item) => item.id !== deletedId),
            count: page.count - 1,
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ONMODEL_KEYS.history(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ONMODEL_KEYS.history() });
    },
  });
}

/**
 * Utility to get flattened history from infinite query data
 */
export function flattenOnModelHistory(
  data: { pages: OnModelHistoryResponse[] } | undefined
): OnModelHistory[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.history || []);
}

/**
 * Hook to manually invalidate on-model cache
 */
export function useInvalidateOnModel() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ONMODEL_KEYS.all });
  };
}
