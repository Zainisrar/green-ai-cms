import { useQuery } from '@tanstack/react-query';
import { insightApi, insightKeys, MiningInsight } from '@/lib/api/insights';

export interface UseInsightsListReturn {
  insights: MiningInsight[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useInsightsList = (): UseInsightsListReturn => {
  const query = useQuery({
    queryKey: insightKeys.lists(),
    queryFn: insightApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    insights: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};