import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backgroundChangeService } from '../services/backgroundChangeService';
import type { 
  BackgroundChangeHistory, 
  BackgroundChangeHistoryResponse,
  GenerateBackgroundChangeRequest,
  GenerateBackgroundChangeResponse,
} from '../types/backgroundChange';
import { InsufficientCreditsError } from '../types/errors';

// Query keys
export const BACKGROUND_CHANGE_KEYS = {
  all: ['backgroundChange'] as const,
  history: () => [...BACKGROUND_CHANGE_KEYS.all, 'history'] as const,
  detail: (id: string) => [...BACKGROUND_CHANGE_KEYS.all, 'detail', id] as const,
};

const PAGE_SIZE = 20;

/**
 * Hook for fetching paginated background change history with caching
 * Data is cached and won't refetch on every navigation unless stale
 */
export function useBackgroundChangeHistory() {
  return useInfiniteQuery<BackgroundChangeHistoryResponse, Error>({
    queryKey: BACKGROUND_CHANGE_KEYS.history(),
    queryFn: async ({ pageParam }) => {
      const offset = ((pageParam as number) - 1) * PAGE_SIZE;
      return backgroundChangeService.getHistory(PAGE_SIZE, offset);
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
 * Hook for fetching a single background change by ID
 */
export function useBackgroundChangeDetail(id: string) {
  return useInfiniteQuery<BackgroundChangeHistory, Error>({
    queryKey: BACKGROUND_CHANGE_KEYS.detail(id),
    queryFn: () => backgroundChangeService.getBackgroundChangeById(id),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: !!id,
  });
}

/**
 * Hook for generating background change with cache invalidation
 */
export function useBackgroundChangeGenerate() {
  const queryClient = useQueryClient();

  return useMutation<GenerateBackgroundChangeResponse, Error | InsufficientCreditsError, GenerateBackgroundChangeRequest>({
    mutationFn: (request) => backgroundChangeService.generateBackgroundChange(request),
    onSuccess: () => {
      // Invalidate history cache to include new generation
      queryClient.invalidateQueries({ queryKey: BACKGROUND_CHANGE_KEYS.history() });
    },
  });
}

/**
 * Hook for deleting a background change with optimistic updates
 */
export function useDeleteBackgroundChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backgroundChangeService.deleteBackgroundChange(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: BACKGROUND_CHANGE_KEYS.history() });
      const previousData = queryClient.getQueryData(BACKGROUND_CHANGE_KEYS.history());

      queryClient.setQueryData<{
        pages: BackgroundChangeHistoryResponse[];
        pageParams: number[];
      }>(BACKGROUND_CHANGE_KEYS.history(), (old) => {
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
        queryClient.setQueryData(BACKGROUND_CHANGE_KEYS.history(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BACKGROUND_CHANGE_KEYS.history() });
    },
  });
}

/**
 * Utility to get flattened history from infinite query data
 */
export function flattenBackgroundChangeHistory(
  data: { pages: BackgroundChangeHistoryResponse[] } | undefined
): BackgroundChangeHistory[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.history || []);
}

/**
 * Hook to manually invalidate background change cache
 */
export function useInvalidateBackgroundChange() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: BACKGROUND_CHANGE_KEYS.all });
  };
}
