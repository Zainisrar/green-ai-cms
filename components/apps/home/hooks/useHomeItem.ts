import { useQuery } from '@tanstack/react-query';
import { homeApi, homeKeys, HomeData } from '@/lib/api/home';

export interface UseHomeItemParams {
  slug: string;
}

export interface UseHomeItemReturn {
  data: HomeData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useHomeItem = ({ slug }: UseHomeItemParams): UseHomeItemReturn => {
  const query = useQuery({
    queryKey: homeKeys.bySlug(slug),
    queryFn: () => homeApi.getBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug,
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