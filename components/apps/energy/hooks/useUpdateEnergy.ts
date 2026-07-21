import { useMutation, useQueryClient } from '@tanstack/react-query';
import { energyApi, energyKeys, EnergyUpdateData } from '@/lib/api/energy';

export function useUpdateEnergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: EnergyUpdateData) => energyApi.update(id, data),
    onSuccess: (updatedEnergy, variables) => {
      // Update the specific energy item in cache
      queryClient.setQueryData(energyKeys.detail(variables.id), updatedEnergy);
      
      // Invalidate and refetch energy list
      queryClient.invalidateQueries({ queryKey: energyKeys.lists() });
      
      // Invalidate all energy queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: energyKeys.all });
    },
    onError: (error) => {
      console.error('Error updating energy:', error);
    },
  });
}