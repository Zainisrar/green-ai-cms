import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys } from '@/lib/api/expertise';

export interface UseDeleteExpertiseReturn {
  mutate: (id: string) => void;
  mutateAsync: (id: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useDeleteExpertise = (): UseDeleteExpertiseReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: expertiseApi.delete,
    onSuccess: async (_, deletedId) => {
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: expertiseKeys.detail(deletedId) });
      
      // Invalidate all expertise queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: expertiseKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete expertise entry:', error);
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: expertiseKeys.lists() });
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