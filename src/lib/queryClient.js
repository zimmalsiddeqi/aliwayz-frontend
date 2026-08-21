import { QueryClient } from '@tanstack/react-query';
import { getErrorMessage } from './utils';
import toast from '@lib/toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry once on failure
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 1;
      },
      retryDelay: 1000,
      // Refetch on window focus for real-time feel
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect (Socket.IO handles real-time)
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        const message = getErrorMessage(error);
        // Global mutation error handler
        // Individual mutations can override this
        if (error?.response?.status !== 422) {
          toast.error(message);
        }
      },
    },
  },
});

// ─────────────────────────────────────────
// Query Key Factory — centralized, type-safe
// ─────────────────────────────────────────
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'],
  },

  // Users
  users: {
    all:     ()           => ['users'],
    profile: (username)   => ['users', 'profile', username],
    badges:  (userId)     => ['users', 'badges', userId],
    reviews: (userId)     => ['users', 'reviews', userId],
    purchases: ()         => ['users', 'purchases'],
    favorites: ()         => ['users', 'favorites'],
    following: ()         => ['users', 'following'],
  },

  // Stores
  stores: {
    all:       ()         => ['stores'],
    bySlug:    (slug)     => ['stores', slug],
    products:  (slug)     => ['stores', slug, 'products'],
    reviews:   (id)       => ['stores', id, 'reviews'],
    analytics: (id)       => ['stores', id, 'analytics'],
    followers: (id)       => ['stores', id, 'followers'],
    popular:   ()         => ['stores', 'popular'],
    featured:  ()         => ['stores', 'featured'],
  },

  // Products
  products: {
    all:         (filters) => ['products', filters],
    byId:        (id)      => ['products', id],
    trending:    ()        => ['products', 'trending'],
    recent:      (page)    => ['products', 'recent', page],
    nearby:      (coords)  => ['products', 'nearby', coords],
    recommended: ()        => ['products', 'recommended'],
    my:          ()        => ['products', 'my'],
  },

  // Categories
  categories: {
    tree:    ()     => ['categories', 'tree'],
    flat:    ()     => ['categories', 'flat'],
    bySlug:  (slug) => ['categories', slug],
  },

  // Search
  search: {
    results:     (q, filters) => ['search', q, filters],
    stores:      (q)          => ['search', 'stores', q],
    suggestions: (q)          => ['search', 'suggestions', q],
    popular:     ()           => ['search', 'popular'],
    history:     ()           => ['search', 'history'],
  },

  // Conversations
  conversations: {
    all:      ()   => ['conversations'],
    byId:     (id) => ['conversations', id],
    messages: (id) => ['conversations', id, 'messages'],
  },

  // QR
  qr: {
    status: (productId) => ['qr', 'status', productId],
  },

  // Reviews
  reviews: {
    user:    (userId)  => ['reviews', 'user', userId],
    store:   (storeId) => ['reviews', 'store', storeId],
    summary: (userId)  => ['reviews', 'summary', userId],
  },

  // Notifications
  notifications: {
    all: () => ['notifications'],
  },

  // Badges
  badges: {
    all:      ()       => ['badges'],
    user:     (userId) => ['badges', 'user', userId],
    progress: ()       => ['badges', 'progress'],
  },

  // Verification
  verification: {
    status: () => ['verification', 'status'],
  },

  // Admin
  admin: {
    dashboard: () => ['admin', 'dashboard'],
    users:     (filters) => ['admin', 'users', filters],
    stores:    (filters) => ['admin', 'stores', filters],
    products:  (filters) => ['admin', 'products', filters],
    reports:   (filters) => ['admin', 'reports', filters],
    logs:      (filters) => ['admin', 'logs', filters],
    verifications: (filters) => ['admin', 'verifications', filters],
  },
};