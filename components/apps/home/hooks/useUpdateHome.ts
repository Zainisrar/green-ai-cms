import { useMutation, useQueryClient } from '@tanstack/react-query';
import { homeApi, homeKeys, UpdateHomeData, HomeData } from '@/lib/api/home';

export interface UseUpdateHomeParams {
  id: string;
  data: UpdateHomeData;
}

export interface UseUpdateHomeReturn {
  mutate: (params: UseUpdateHomeParams) => void;
  mutateAsync: (params: UseUpdateHomeParams) => Promise<HomeData>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useUpdateHome = (): UseUpdateHomeReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UseUpdateHomeParams) => homeApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: homeKeys.detail(id) });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<HomeData>(homeKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData<HomeData>(homeKeys.detail(id), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(homeKeys.detail(id), context.previousData);
      }
      console.error('Failed to update home entry:', error);
    },
    onSuccess: async (updatedHome, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(homeKeys.detail(id), updatedHome);
      
      // Also update by slug cache
      queryClient.setQueryData(homeKeys.bySlug(updatedHome.slug), updatedHome);
      
      // Invalidate all home queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: homeKeys.all });
    },
    onSettled: async (_, __, { id }) => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: homeKeys.detail(id) });
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