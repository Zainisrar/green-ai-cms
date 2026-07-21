import { useMutation, useQueryClient } from '@tanstack/react-query';
import { navigationApi, navigationKeys, NavItem } from '@/lib/api/navigation';

export interface UseDeleteNavigationReturn {
  mutate: (id: string) => void;
  mutateAsync: (id: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useDeleteNavigation = (): UseDeleteNavigationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: navigationApi.delete,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: navigationKeys.lists() });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NavItem[]>(navigationKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData<NavItem[]>(navigationKeys.lists(), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(item => item.id.toString() !== id);
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(navigationKeys.lists(), context.previousData);
      }
      console.error('Failed to delete navigation item:', error);
    },
    onSuccess: async (_, deletedId) => {
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: navigationKeys.detail(deletedId) });
      
      // Invalidate all navigation queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: navigationKeys.all });
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: navigationKeys.lists() });
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