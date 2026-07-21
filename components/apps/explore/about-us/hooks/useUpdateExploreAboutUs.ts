import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exploreAboutUsApi, exploreAboutUsKeys, ExploreAboutUsData } from '@/lib/api/exploreAboutUs';

interface UpdateByIdParams {
  id: string;
  data: Partial<ExploreAboutUsData>;
}

interface UpdateByKeyParams {
  key: string;
  data: Partial<ExploreAboutUsData>;
}

export function useUpdateExploreAboutUsById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateByIdParams) => exploreAboutUsApi.updateById(id, data),
    onSuccess: (updatedEntry, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(exploreAboutUsKeys.detail(variables.id), updatedEntry);
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: exploreAboutUsKeys.lists() });
      
      // Invalidate all queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: exploreAboutUsKeys.all });
    },
    onError: (error) => {
      console.error('Error updating about-us entry:', error);
    },
  });
}

export function useUpdateExploreAboutUsByKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: UpdateByKeyParams) => exploreAboutUsApi.updateByKey(key, data),
    onSuccess: (updatedEntry, variables) => {
      // Update the specific entry in cache
      queryClient.setQueryData(exploreAboutUsKeys.detailByKey(variables.key), updatedEntry);
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: exploreAboutUsKeys.lists() });
      
      // Invalidate all queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: exploreAboutUsKeys.all });
    },
    onError: (error) => {
      console.error('Error updating about-us entry:', error);
    },
  });
}