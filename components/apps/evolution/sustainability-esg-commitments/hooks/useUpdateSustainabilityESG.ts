'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateSustainabilityESGParams {
  id?: number;
  data: any;
}

export const useUpdateSustainabilityESG = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateSustainabilityESGParams) => {
      const url = '/api/evolution/sustainability-esg-commitments';
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
        throw new Error(errorData.error || 'Failed to update sustainability ESG');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch sustainability ESG data
      queryClient.invalidateQueries({
        queryKey: ['evolution-sustainability-esg'],
      });
    },
    onError: (error) => {
      console.error('Error updating sustainability ESG:', error);
    },
  });
};