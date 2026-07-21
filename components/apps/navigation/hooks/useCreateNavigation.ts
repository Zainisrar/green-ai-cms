import { useMutation, useQueryClient } from '@tanstack/react-query';
import { navigationApi, navigationKeys, CreateNavigationData, NavItem } from '@/lib/api/navigation';

export interface UseCreateNavigationReturn {
  mutate: (data: CreateNavigationData) => void;
  mutateAsync: (data: CreateNavigationData) => Promise<NavItem>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  data: NavItem | undefined;
  reset: () => void;
}

export const useCreateNavigation = (): UseCreateNavigationReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: navigationApi.create,
    onSuccess: async (newItem) => {
      // Invalidate and refetch navigation list
      await queryClient.invalidateQueries({ queryKey: navigationKeys.lists() });
      
      // Invalidate all navigation queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: navigationKeys.all });
      
      // Add the new item to the cache
      if (newItem) {
        queryClient.setQueryData(navigationKeys.detail(newItem.id.toString()), newItem);
        
        // Optimistically add to the list cache
        queryClient.setQueryData(navigationKeys.lists(), (oldData: NavItem[] | undefined) => {
          if (!oldData) return [newItem];
          return [...oldData, newItem];
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create navigation item:', error);
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