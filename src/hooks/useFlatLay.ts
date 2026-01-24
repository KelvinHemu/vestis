import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flatLayService } from '../services/flatLayService';
import type {
  FlatLayHistory,
  FlatLayHistoryResponse,
  GenerateFlatLayRequest,
  GenerateFlatLayResponse,
} from '../types/flatlay';
import { InsufficientCreditsError } from '../types/errors';
import { CREDITS_QUERY_KEY } from './useUser';

// Query keys
export const FLATLAY_KEYS = {
  all: ['flatlay'] as const,
  history: () => [...FLATLAY_KEYS.all, 'history'] as const,
  detail: (id: string) => [...FLATLAY_KEYS.all, 'detail', id] as const,
};

const PAGE_SIZE = 20;

/**
 * Hook for fetching paginated flatlay history with caching
 * Data is cached and won't refetch on every navigation unless stale
 */
export function useFlatLayHistory() {
  return useInfiniteQuery<FlatLayHistoryResponse, Error>({
    queryKey: FLATLAY_KEYS.history(),
    queryFn: async ({ pageParam }) => {
      const offset = ((pageParam as number) - 1) * PAGE_SIZE;
      return flatLayService.getHistory(PAGE_SIZE, offset);
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
 * Hook for fetching a single flatlay by ID
 */
export function useFlatLayDetail(id: string) {
  return useInfiniteQuery<FlatLayHistory, Error>({
    queryKey: FLATLAY_KEYS.detail(id),
    queryFn: () => flatLayService.getFlatLayById(id),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!id,
  });
}

/**
 * Hook for generating flatlay images with cache invalidation
 */
export function useFlatLayGenerate() {
  const queryClient = useQueryClient();

  return useMutation<GenerateFlatLayResponse, Error | InsufficientCreditsError, GenerateFlatLayRequest>({
    mutationFn: (request) => flatLayService.generateFlatlay(request),
    onSuccess: () => {
      // Invalidate history cache to include new generation
      queryClient.invalidateQueries({ queryKey: FLATLAY_KEYS.history() });
      // Invalidate credits query to refresh balance after generation
      queryClient.invalidateQueries({ queryKey: CREDITS_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a flatlay with optimistic updates
 */
export function useDeleteFlatLay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => flatLayService.deleteFlatLay(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: FLATLAY_KEYS.history() });
      const previousData = queryClient.getQueryData(FLATLAY_KEYS.history());

      queryClient.setQueryData<{
        pages: FlatLayHistoryResponse[];
        pageParams: number[];
      }>(FLATLAY_KEYS.history(), (old) => {
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
        queryClient.setQueryData(FLATLAY_KEYS.history(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FLATLAY_KEYS.history() });
    },
  });
}

/**
 * Utility to get flattened history from infinite query data
 */
export function flattenFlatLayHistory(
  data: { pages: FlatLayHistoryResponse[] } | undefined
): FlatLayHistory[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.history || []);
}

/**
 * Hook to manually invalidate flatlay cache
 */
export function useInvalidateFlatLay() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: FLATLAY_KEYS.all });
  };
}
