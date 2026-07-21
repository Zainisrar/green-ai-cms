import { useQuery } from '@tanstack/react-query';
import { expertiseApi, expertiseKeys, ExpertiseData } from '@/lib/api/expertise';

export interface UseExpertiseListReturn {
  data: ExpertiseData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useExpertiseList = (): UseExpertiseListReturn => {
  const query = useQuery({
    queryKey: expertiseKeys.lists(),
    queryFn: expertiseApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
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