'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateOMMonitoringParams {
  id?: number;
  data: any;
}

export const useUpdateOMMonitoring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateOMMonitoringParams) => {
      const url = '/api/engineering/om-monitoring';
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
        throw new Error(errorData.error || 'Failed to update O&M monitoring');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch O&M monitoring data
      queryClient.invalidateQueries({
        queryKey: ['engineering-om-monitoring'],
      });
    },
    onError: (error) => {
      console.error('Error updating O&M monitoring:', error);
    },
  });
};