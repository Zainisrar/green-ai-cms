import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreWhyGreenApi, exploreWhyGreenKeys, ExploreWhyGreenData } from '@/lib/api/exploreWhyGreen';

interface UpdateByIdParams {
  id: string;
  data: Partial<ExploreWhyGreenData>;
}

export function useUpdateExploreWhyGreenById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateByIdParams) => exploreWhyGreenApi.updateById(id, data),
    onSuccess: (updatedEntry, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(exploreWhyGreenKeys.detail(variables.id), updatedEntry);
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: exploreWhyGreenKeys.lists() });
      
      // Invalidate all queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: exploreWhyGreenKeys.all });
    },
    onError: (error) => {
      console.error('Error updating why-green entry:', error);
    },
  });
}