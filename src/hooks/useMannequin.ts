import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mannequinService } from '../services/mannequinService';
import type {
  FlatLayHistory,
  FlatLayHistoryResponse,
  GenerateFlatLayRequest,
  GenerateFlatLayResponse,
} from '../types/flatlay';
import { InsufficientCreditsError } from '../types/errors';
import { USER_QUERY_KEY } from './useUser';

// Query keys
export const MANNEQUIN_KEYS = {
  all: ['mannequin'] as const,
  history: () => [...MANNEQUIN_KEYS.all, 'history'] as const,
  detail: (id: string) => [...MANNEQUIN_KEYS.all, 'detail', id] as const,
};

const PAGE_SIZE = 20;

/**
 * Hook for fetching paginated mannequin history with caching
 * Data is cached and won't refetch on every navigation unless stale
 */
export function useMannequinHistory() {
  return useInfiniteQuery<FlatLayHistoryResponse, Error>({
    queryKey: MANNEQUIN_KEYS.history(),
    queryFn: async ({ pageParam }) => {
      const offset = ((pageParam as number) - 1) * PAGE_SIZE;
      return mannequinService.getHistory(PAGE_SIZE, offset);
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
 * Hook for fetching a single mannequin by ID
 */
export function useMannequinDetail(id: string) {
  return useInfiniteQuery<FlatLayHistory, Error>({
    queryKey: MANNEQUIN_KEYS.detail(id),
    queryFn: () => mannequinService.getMannequinById(id),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!id,
  });
}

/**
 * Hook for generating mannequin images with cache invalidation
 */
export function useMannequinGenerate() {
  const queryClient = useQueryClient();

  return useMutation<GenerateFlatLayResponse, Error | InsufficientCreditsError, GenerateFlatLayRequest>({
    mutationFn: (request) => mannequinService.generateMannequin(request),
    onSuccess: () => {
      // Invalidate history cache to include new generation
      queryClient.invalidateQueries({ queryKey: MANNEQUIN_KEYS.history() });
      // Invalidate user query to refresh credits
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a mannequin with optimistic updates
 */
export function useDeleteMannequin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mannequinService.deleteMannequin(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: MANNEQUIN_KEYS.history() });
      const previousData = queryClient.getQueryData(MANNEQUIN_KEYS.history());

      queryClient.setQueryData<{
        pages: FlatLayHistoryResponse[];
        pageParams: number[];
      }>(MANNEQUIN_KEYS.history(), (old) => {
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
        queryClient.setQueryData(MANNEQUIN_KEYS.history(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MANNEQUIN_KEYS.history() });
    },
  });
}

/**
 * Utility to get flattened history from infinite query data
 */
export function flattenMannequinHistory(
  data: { pages: FlatLayHistoryResponse[] } | undefined
): FlatLayHistory[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.history || []);
}

/**
 * Hook to manually invalidate mannequin cache
 */
export function useInvalidateMannequin() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: MANNEQUIN_KEYS.all });
  };
}
