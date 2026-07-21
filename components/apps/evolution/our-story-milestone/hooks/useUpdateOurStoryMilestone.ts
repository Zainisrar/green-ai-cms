import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EvolutionOurStoryMilestone, type EvolutionOurStoryMilestoneInsert } from '@/db/schema';

interface UpdateOurStoryMilestoneData {
  id?: number;
  key?: string;
  title: string;
  description: string;
  ourMilestone: EvolutionOurStoryMilestoneInsert['ourMilestone'];
}

export function useUpdateOurStoryMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOurStoryMilestoneData): Promise<EvolutionOurStoryMilestone> => {
      const url = '/api/evolution/our-story-milestone';
      const method = data.id || data.key ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update our story milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-our-story-milestone'] });
    },
  });
}

export function useUpdateOurStoryMilestoneByKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { key: string } & Partial<UpdateOurStoryMilestoneData>): Promise<EvolutionOurStoryMilestone> => {
      const url = '/api/evolution/our-story-milestone';
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update our story milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution-our-story-milestone'] });
    },
  });
}