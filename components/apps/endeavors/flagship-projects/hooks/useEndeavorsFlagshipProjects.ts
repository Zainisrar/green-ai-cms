import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchEndeavorsFlagshipProject, 
    updateEndeavorsFlagshipProject,
    FlagshipProjectFormData 
} from '@/lib/api/endeavorsFlagshipProjects';

export const useEndeavorsFlagshipProject = () => {
    return useQuery({
        queryKey: ['endeavorsFlagshipProject'],
        queryFn: fetchEndeavorsFlagshipProject,
        staleTime: 0, // Data is immediately stale
        gcTime: 0, // Don't cache data
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
};

export const useUpdateEndeavorsFlagshipProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateEndeavorsFlagshipProject,
        onSuccess: (data) => {
            // Immediately set the fresh data and don't refetch
            queryClient.setQueryData(['endeavorsFlagshipProject'], data);
        },
    });
};