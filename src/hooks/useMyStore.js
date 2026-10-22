import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@store/auth.store';
import StoreService from '@api/services/store.service';
import { isSeller } from '@lib/utils';

export default function useMyStore() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const canHaveStore = isAuthenticated && user?.role !== 'admin';

  const query = useQuery({
    queryKey: ['my-store', user?.id],
    queryFn: async () => {
      try {
        const r = await StoreService.getMyStore();
        return r?.data?.store || r?.data || null;
      } catch (err) {
        // If user is a buyer without a store (403/404), gracefully return null instead of throwing error
        if (err?.response?.status === 403 || err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: canHaveStore,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Auto-sync user role to 'both' in client state if the user already has a store
  useEffect(() => {
    if (query.data && user && !isSeller(user.role) && user.role !== 'admin') {
      setUser({ role: 'both' });
    }
  }, [query.data, user, setUser]);

  return {
    store: query.data || null,
    hasStore: !!query.data,
    isLoading: query.isLoading && canHaveStore,
    isError: query.isError,
    refetch: query.refetch,
  };
}
