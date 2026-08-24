import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '@api/axios.instance';
import { disconnectSocket } from '@lib/socket';

const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    user:            null,
    accessToken:     getAccessToken(),   // ← Read from sessionStorage
    refreshToken:    getRefreshToken(),  // ← Read from sessionStorage
    isAuthenticated: !!getAccessToken(), // ← Check if tokens exist
    isInitialized:   false,
    isLoading:       false,

    setAuth: (user, accessToken, refreshToken) => {
      setTokens(accessToken, refreshToken);
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading:       false,
        isInitialized:   true,
      });
      // Fetch user favorites upon successful authentication
      try {
        const { useFavoritesStore } = require('./favorites.store');
        useFavoritesStore.getState().fetchFavorites();
      } catch (e) {
        console.error('Failed to require favorites store:', e);
      }
    },

    setUser: (userData) => {
      set((state) => ({
        user: { ...state.user, ...userData },
      }));
    },

    setTokens: (accessToken, refreshToken) => {
      setTokens(accessToken, refreshToken);
      set({ accessToken, refreshToken });
    },

    logout: () => {
      clearTokens();
      disconnectSocket();
      set({
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        isLoading:       false,
        isInitialized:   true,
      });
      // Clear favorites from store
      try {
        const { useFavoritesStore } = require('./favorites.store');
        useFavoritesStore.getState().clear();
      } catch (e) {
        console.error('Failed to require favorites store on logout:', e);
      }
    },

    setLoading:     (isLoading)   => set({ isLoading }),
    setInitialized: ()            => set({ isInitialized: true }),

    isSeller: () => ['seller', 'both', 'admin'].includes(get().user?.role),
    isBuyer:  () => ['buyer', 'both', 'admin'].includes(get().user?.role),
    isAdmin:  () => get().user?.role === 'admin',
  }))
);

// Listen for auth events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
  window.addEventListener('auth:banned', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;