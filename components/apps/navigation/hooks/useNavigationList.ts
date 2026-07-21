import { useQuery } from '@tanstack/react-query';
import { navigationApi, navigationKeys, NavItem } from '@/lib/api/navigation';

export interface UseNavigationListReturn {
  data: NavItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useNavigationList = (): UseNavigationListReturn => {
  const query = useQuery({
    queryKey: navigationKeys.lists(),
    queryFn: navigationApi.getAll,
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