import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreGlobalSnapshotApi, exploreGlobalSnapshotKeys, ExploreGlobalSnapshotData } from '@/lib/api/exploreGlobalSnapshot';

interface UpdateByIdParams {
  id: string;
  data: Partial<ExploreGlobalSnapshotData>;
}

export function useUpdateGlobalSnapshotById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateByIdParams) => exploreGlobalSnapshotApi.updateById(id, data),
    onSuccess: (updatedEntry, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(exploreGlobalSnapshotKeys.detail(variables.id), updatedEntry);
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: exploreGlobalSnapshotKeys.lists() });
      
      // Invalidate all queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: exploreGlobalSnapshotKeys.all });
    },
    onError: (error) => {
      console.error('Error updating global snapshot entry:', error);
    },
  });
}