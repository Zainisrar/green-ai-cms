import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys, UpdateExpertiseData } from '@/lib/api/expertise';

interface UpdateExpertiseParams {
    id: string;
    data: UpdateExpertiseData;
}

export const useUpdateExpertise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: UpdateExpertiseParams) => expertiseApi.update(id, data),
        onSuccess: (updatedExpertise, { id }) => {
            // Update the specific item in cache
            queryClient.setQueryData(expertiseKeys.detail(id), updatedExpertise);
            
            // Invalidate and refetch the list
            queryClient.invalidateQueries({ queryKey: expertiseKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to update expertise:', error);
        },
    });
};