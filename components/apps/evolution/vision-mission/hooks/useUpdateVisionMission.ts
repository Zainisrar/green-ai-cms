import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EvolutionVisionMission, type EvolutionVisionMissionInsert } from '@/db/schema';

interface UpdateVisionMissionData {
  id?: number;
  sections: EvolutionVisionMissionInsert['sections'];
}

export function useUpdateVisionMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateVisionMissionData): Promise<EvolutionVisionMission> => {
      const url = '/api/evolution/vision-mission';
      const method = data.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update vision mission');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-vision-mission'] });
    },
  });
}