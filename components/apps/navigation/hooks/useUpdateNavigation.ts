import { useMutation, useQueryClient } from '@tanstack/react-query';
import { navigationApi, navigationKeys, UpdateNavigationData, NavItem } from '@/lib/api/navigation';

export interface UseUpdateNavigationParams {
  id: string;
  data: UpdateNavigationData;
}

export interface UseUpdateNavigationReturn {
  mutate: (params: UseUpdateNavigationParams) => void;
  mutateAsync: (params: UseUpdateNavigationParams) => Promise<NavItem>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  data: NavItem | undefined;
  reset: () => void;
}

export const useUpdateNavigation = (): UseUpdateNavigationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UseUpdateNavigationParams) => navigationApi.update(id, data),
    onSuccess: async (updatedItem, { id }) => {
      // Invalidate and refetch navigation list
      await queryClient.invalidateQueries({ queryKey: navigationKeys.lists() });
      
      // Invalidate all navigation queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: navigationKeys.all });
      
      // Update the specific item in cache if we have the updated data
      if (updatedItem) {
        queryClient.setQueryData(navigationKeys.detail(id), updatedItem);
      }
    },
    onError: (error) => {
      console.error('Failed to update navigation item:', error);
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
    data: mutation.data,
    reset: mutation.reset,
  };
};