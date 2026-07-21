'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateHybridMicrogridParams {
  id?: number;
  data: any;
}

export const useUpdateHybridMicrogrid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateHybridMicrogridParams) => {
      const url = '/api/engineering/hybrid-microgrid-solutions';
      const method = id ? 'PUT' : 'POST';
      const body = id ? { id, ...data } : data;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hybrid microgrid solutions');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch hybrid microgrid data
      queryClient.invalidateQueries({
        queryKey: ['engineering-hybrid-microgrid'],
      });
    },
    onError: (error) => {
      console.error('Error updating hybrid microgrid solutions:', error);
    },
  });
};