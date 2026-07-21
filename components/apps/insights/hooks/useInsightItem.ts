import { useQuery } from '@tanstack/react-query';
import { insightApi, insightKeys, MiningInsight } from '@/lib/api/insights';

export interface UseInsightItemParams {
  id: string;
}

export interface UseInsightItemReturn {
  data: MiningInsight | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useInsightItem = ({ id }: UseInsightItemParams): UseInsightItemReturn => {
  const query = useQuery({
    queryKey: insightKeys.detail(id),
    queryFn: () => insightApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isError: query.isError,
  };
};