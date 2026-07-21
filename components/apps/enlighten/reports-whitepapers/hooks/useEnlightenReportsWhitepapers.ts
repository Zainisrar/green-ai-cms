import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enlightenReportsWhitepapersApi } from '@/lib/api/enlightenReportsWhitepapers';
import { EnlightenReportsWhitepaper, EnlightenReportsWhitepaperInsert } from '@/db/schema';

const QUERY_KEY = 'enlighten-reports-whitepapers';

// Hook to fetch all reports
export const useEnlightenReportsWhitepapers = () => {
    return useQuery({
        queryKey: [QUERY_KEY],
        queryFn: enlightenReportsWhitepapersApi.getAll,
    });
};

// Hook to create a new report
export const useCreateEnlightenReportsWhitepaper = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (report: Omit<EnlightenReportsWhitepaperInsert, 'id' | 'createdAt' | 'updatedAt'>) =>
            enlightenReportsWhitepapersApi.create(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

// Hook to update a report
export const useUpdateEnlightenReportsWhitepaper = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (report: Partial<EnlightenReportsWhitepaper> & { id: number }) =>
            enlightenReportsWhitepapersApi.update(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

// Hook to delete a report
export const useDeleteEnlightenReportsWhitepaper = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: number) => enlightenReportsWhitepapersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};