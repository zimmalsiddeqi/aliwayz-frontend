import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@store/auth.store';
import StoreService from '@api/services/store.service';
import { isSeller } from '@lib/utils';

export default function useMyStore() {
  const { user, isAuthenticated } = useAuthStore();
  const hasSeller = isAuthenticated && isSeller(user?.role);

  const query = useQuery({
    queryKey: ['my-store', user?.id],
    queryFn:  () => StoreService.getMyStore().then((r) => r.data),
    enabled:  hasSeller,
    staleTime: 5 * 60 * 1000,
    retry:    false,
  });

  return {
    store:     query.data || null,
    hasStore:  !!query.data,
    isLoading: query.isLoading && hasSeller,
    isError:   query.isError,
    refetch:   query.refetch,
  };
}