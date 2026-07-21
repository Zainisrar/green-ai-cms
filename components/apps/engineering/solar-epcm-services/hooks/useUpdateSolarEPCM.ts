'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateSolarEPCMParams {
  id?: number;
  data: any;
}

export const useUpdateSolarEPCM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateSolarEPCMParams) => {
      const url = '/api/engineering/solar-epcm-services';
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
        throw new Error(errorData.error || 'Failed to update solar EPCM services');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch solar EPCM data
      queryClient.invalidateQueries({
        queryKey: ['engineering-solar-epcm'],
      });
    },
    onError: (error) => {
      console.error('Error updating solar EPCM services:', error);
    },
  });
};