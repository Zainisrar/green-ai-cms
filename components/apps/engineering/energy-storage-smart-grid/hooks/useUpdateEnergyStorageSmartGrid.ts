'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateEnergyStorageSmartGridParams {
  id?: number;
  data: any;
}

export const useUpdateEnergyStorageSmartGrid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateEnergyStorageSmartGridParams) => {
      const url = '/api/engineering/energy-storage-smart-grid';
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
        throw new Error(errorData.error || 'Failed to update energy storage smart grid');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch energy storage smart grid data
      queryClient.invalidateQueries({
        queryKey: ['engineering-energy-storage-smart-grid'],
      });
    },
    onError: (error) => {
      console.error('Error updating energy storage smart grid:', error);
    },
  });
};