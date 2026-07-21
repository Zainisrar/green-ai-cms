import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enlightenInsightsArticlesApi } from '@/lib/api/enlightenInsightsArticles';
import { EnlightenInsightsArticle, EnlightenInsightsArticleInsert } from '@/db/schema';

const QUERY_KEY = 'enlighten-insights-articles';

// Hook to fetch all articles
export const useEnlightenInsightsArticles = () => {
    return useQuery({
        queryKey: [QUERY_KEY],
        queryFn: enlightenInsightsArticlesApi.getAll,
    });
};

// Hook to create a new article
export const useCreateEnlightenInsightsArticle = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (article: Omit<EnlightenInsightsArticleInsert, 'id' | 'createdAt' | 'updatedAt'>) =>
            enlightenInsightsArticlesApi.create(article),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

// Hook to update an article
export const useUpdateEnlightenInsightsArticle = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (article: Partial<EnlightenInsightsArticle> & { id: number }) =>
            enlightenInsightsArticlesApi.update(article),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};

// Hook to delete an article
export const useDeleteEnlightenInsightsArticle = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: number) => enlightenInsightsArticlesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
    });
};