import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EvolutionLeadershipTeam, type EvolutionLeadershipTeamInsert } from '@/db/schema';

interface UpdateLeadershipTeamData {
  id?: number;
  sections: EvolutionLeadershipTeamInsert['sections'];
}

export function useUpdateLeadershipTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadershipTeamData): Promise<EvolutionLeadershipTeam> => {
      const url = '/api/evolution/leadership-team';
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
        throw new Error(error.error || 'Failed to update leadership team');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-leadership-team'] });
    },
  });
}