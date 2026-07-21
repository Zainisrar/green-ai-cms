import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insightDetailApi, insightDetailKeys, UpdateInsightDetailData, InsightDetailData } from '@/lib/api/insightDetails';

export interface UseUpdateInsightDetailParams {
  id: string;
  data: UpdateInsightDetailData;
}

export interface UseUpdateInsightDetailReturn {
  mutate: (params: UseUpdateInsightDetailParams) => void;
  mutateAsync: (params: UseUpdateInsightDetailParams) => Promise<InsightDetailData>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useUpdateInsightDetail = (): UseUpdateInsightDetailReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UseUpdateInsightDetailParams) => insightDetailApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: insightDetailKeys.detail(id) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<InsightDetailData>(insightDetailKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData<InsightDetailData>(insightDetailKeys.detail(id), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(insightDetailKeys.detail(id), context.previousData);
      }
      console.error('Failed to update insight detail:', error);
    },
    onSuccess: async (updatedDetail, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(insightDetailKeys.detail(id), updatedDetail);
      
      // Invalidate all insight detail queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: insightDetailKeys.all });
    },
    onSettled: async (_, __, { id }) => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: insightDetailKeys.detail(id) });
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