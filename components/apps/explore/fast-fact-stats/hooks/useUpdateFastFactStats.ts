import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ExploreFastFactStats, type ExploreFastFactStatsInsert } from '@/db/schema';

interface UpdateFastFactStatsData {
  id?: number;
  sections: ExploreFastFactStatsInsert['sections'];
}

export function useUpdateFastFactStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFastFactStatsData): Promise<ExploreFastFactStats> => {
      const url = '/api/explore/fast-fact-stats';
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
        throw new Error(error.error || 'Failed to update fast fact stats');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fast-fact-stats'] });
    },
  });
}