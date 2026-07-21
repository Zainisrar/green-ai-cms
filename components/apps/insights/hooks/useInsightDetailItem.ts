import { useQuery } from '@tanstack/react-query';
import { insightDetailApi, insightDetailKeys, InsightDetailData } from '@/lib/api/insightDetails';

export interface UseInsightDetailItemParams {
  id: string;
}

export interface UseInsightDetailItemReturn {
  data: InsightDetailData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useInsightDetailItem = ({ id }: UseInsightDetailItemParams): UseInsightDetailItemReturn => {
  const query = useQuery({
    queryKey: insightDetailKeys.detail(id),
    queryFn: () => insightDetailApi.getById(id),
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