import { useQuery } from '@tanstack/react-query';
import { navigationApi, navigationKeys, NavItem } from '@/lib/api/navigation';

export interface UseNavigationItemParams {
  id: string;
  enabled?: boolean;
}

export interface UseNavigationItemReturn {
  data: NavItem | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export const useNavigationItem = ({ id, enabled = true }: UseNavigationItemParams): UseNavigationItemReturn => {
  const query = useQuery({
    queryKey: navigationKeys.detail(id),
    queryFn: () => navigationApi.getById(id),
    enabled: enabled && !!id,
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