import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys, CreateExpertiseData } from '@/lib/api/expertise';

export const useCreateExpertise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateExpertiseData) => expertiseApi.create(data),
        onSuccess: (newExpertise) => {
            // Invalidate and refetch the list to include the new item
            queryClient.invalidateQueries({ queryKey: expertiseKeys.lists() });
        },
        onError: (error) => {
            console.error('Failed to create expertise:', error);
        },
    });
};