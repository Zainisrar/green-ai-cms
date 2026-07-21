import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EngineeringGridIntelInsert } from '@/db/schema';

interface UpdateGridIntelPayload {
  id?: number;
  data: Partial<EngineeringGridIntelInsert>;
}

async function updateGridIntel({ id, data }: UpdateGridIntelPayload) {
  const url = '/api/engineering/grid-intel';
  const method = id ? 'PUT' : 'POST';
  const payload = id ? { id, ...data } : data;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update Grid Intel');
  }

  return response.json();
}

export function useUpdateGridIntel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGridIntel,
    onSuccess: () => {
      // Invalidate and refetch Grid Intel data
      queryClient.invalidateQueries({ queryKey: ['engineering-grid-intel'] });
    },
    onError: (error) => {
      console.error('Error updating Grid Intel:', error);
    },
  });
}