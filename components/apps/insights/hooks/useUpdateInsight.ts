import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insightApi, insightKeys, UpdateInsightData, MiningInsight } from '@/lib/api/insights';

export interface UseUpdateInsightParams {
  id: string;
  data: UpdateInsightData;
}

export interface UseUpdateInsightReturn {
  mutate: (params: UseUpdateInsightParams) => void;
  mutateAsync: (params: UseUpdateInsightParams) => Promise<MiningInsight>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useUpdateInsight = (): UseUpdateInsightReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UseUpdateInsightParams) => insightApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: insightKeys.detail(id) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<MiningInsight>(insightKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData<MiningInsight>(insightKeys.detail(id), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(insightKeys.detail(id), context.previousData);
      }
      console.error('Failed to update insight:', error);
    },
    onSuccess: async (updatedInsight, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(insightKeys.detail(id), updatedInsight);
      
      // Invalidate all insight queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
    onSettled: async (_, __, { id }) => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: insightKeys.detail(id) });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending, // For backward compatibility
    isPending: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};