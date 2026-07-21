'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateCertificationsAccreditationsParams {
  id?: number;
  data: any;
}

export const useUpdateCertificationsAccreditations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateCertificationsAccreditationsParams) => {
      const url = '/api/evolution/certifications-accreditations';
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
        throw new Error(errorData.error || 'Failed to update certifications accreditations');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch certifications accreditations data
      queryClient.invalidateQueries({
        queryKey: ['evolution-certifications-accreditations'],
      });
    },
    onError: (error) => {
      console.error('Error updating certifications accreditations:', error);
    },
  });
};