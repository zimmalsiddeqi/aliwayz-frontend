import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@store/auth.store';
import axiosInstance from '@api/axios.instance';
import { isSeller } from '@lib/utils';

/**
 * Global hook to get current user's store
 * Used throughout seller dashboard
 */
export default function useMyStore() {
  const { user, isAuthenticated } = useAuthStore();
  const hasSeller = isAuthenticated && isSeller(user?.role);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-store'],
    queryFn:  async () => {
      const response = await axiosInstance.get('/stores', {
        params: { user_id: user?.id },
      }).catch(() => null);

      // Try fetching by finding store with user_id match
      // Backend doesn't have /stores/my so we query differently
      const res = await axiosInstance.get(`/users/me`);
      const userData = res.data?.data;

      if (!userData) return null;

      // Now get store by user's username (stores have slug = username sometimes)
      // Better approach: query stores table directly
      const storeRes = await axiosInstance
        .get(`/stores/${userData.username}`)
        .catch(() => null);

      if (storeRes?.data?.data) return storeRes.data.data;

      // Fallback: search all stores owned by this user
      return null;
    },
    enabled:  hasSeller,
    staleTime: 5 * 60 * 1000,
    retry:    false,
  });

  return {
    store:      data || null,
    hasStore:   !!data,
    isLoading:  isLoading && hasSeller,
    isError,
    refetch,
  };
}