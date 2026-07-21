import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchEndeavorsProjects, 
    createEndeavorsProject, 
    updateEndeavorsProject, 
    deleteEndeavorsProject,
    ProjectFormData 
} from '@/lib/api/endeavorsProjects';

export const useEndeavorsProjects = () => {
    return useQuery({
        queryKey: ['endeavorsProjects'],
        queryFn: fetchEndeavorsProjects,
    });
};

export const useCreateEndeavorsProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createEndeavorsProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endeavorsProjects'] });
        },
    });
};

export const useUpdateEndeavorsProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProjectFormData }) => 
            updateEndeavorsProject(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endeavorsProjects'] });
        },
    });
};

export const useDeleteEndeavorsProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteEndeavorsProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endeavorsProjects'] });
        },
    });
};