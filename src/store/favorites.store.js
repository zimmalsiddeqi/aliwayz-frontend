import { create } from 'zustand';
import FavoriteService from '@api/services/favorite.service';
import ProductService from '@api/services/product.service';

export const useFavoritesStore = create((set, get) => ({
  ids: new Set(),
  pendingIds: new Set(),
  isInitialized: false,

  // Load all favorites from server to populate IDs
  fetchFavorites: async () => {
    try {
      // Query with large limit to fetch all user favorites
      const response = await FavoriteService.getAll({ page: 1, limit: 1000 });
      const rawList = response?.data || [];

      const extractedIds = new Set();
      rawList.forEach((item) => {
        if (!item) return;
        // Handle shapes where product is nested inside favorite join
        const prod = item.products || item.product || item;
        const prodId = prod.id;
        if (prodId) {
          extractedIds.add(prodId);
        }
      });

      set({ ids: extractedIds, isInitialized: true });
    } catch (error) {
      console.error('[Favorites Store] Failed to fetch favorites:', error);
    }
  },

  // Toggle favorite status optimistically
  toggleFavorite: async (productId) => {
    const { ids, pendingIds } = get();

    // Prevent concurrent requests on the same product ID
    if (pendingIds.has(productId)) return;

    const isCurrentlyFav = ids.has(productId);

    // 1. Optimistic Update (Modify set immediately)
    const nextIds = new Set(ids);
    if (isCurrentlyFav) {
      nextIds.delete(productId);
    } else {
      nextIds.add(productId);
    }

    const nextPending = new Set(pendingIds);
    nextPending.add(productId);

    set({ ids: nextIds, pendingIds: nextPending });

    // 2. Perform API call
    try {
      let response;
      if (isCurrentlyFav) {
        response = await ProductService.unfavorite(productId);
      } else {
        response = await ProductService.favorite(productId);
      }

      // Successful operation: remove from pending
      set((state) => {
        const updatedPending = new Set(state.pendingIds);
        updatedPending.delete(productId);
        return { pendingIds: updatedPending };
      });

      return { action: isCurrentlyFav ? 'removed' : 'added', success: true };
    } catch (error) {
      console.error('[Favorites Store] API update failed, rolling back:', error);

      // 3. Rollback on failure
      set((state) => {
        const rollbackIds = new Set(state.ids);
        if (isCurrentlyFav) {
          rollbackIds.add(productId); // Re-add if it was removed
        } else {
          rollbackIds.delete(productId); // Remove if it was added
        }

        const updatedPending = new Set(state.pendingIds);
        updatedPending.delete(productId);

        return { ids: rollbackIds, pendingIds: updatedPending };
      });

      throw error;
    }
  },

  // Direct remove action for lists
  removeFavoriteDirect: async (productId) => {
    const { ids, pendingIds } = get();
    if (pendingIds.has(productId)) return;

    // Optimistic Update
    const nextIds = new Set(ids);
    nextIds.delete(productId);

    const nextPending = new Set(pendingIds);
    nextPending.add(productId);

    set({ ids: nextIds, pendingIds: nextPending });

    try {
      await FavoriteService.remove(productId);

      set((state) => {
        const updatedPending = new Set(state.pendingIds);
        updatedPending.delete(productId);
        return { pendingIds: updatedPending };
      });

      return { action: 'removed', success: true };
    } catch (error) {
      console.error('[Favorites Store] Direct remove failed, rolling back:', error);
      set((state) => {
        const rollbackIds = new Set(state.ids);
        rollbackIds.add(productId);

        const updatedPending = new Set(state.pendingIds);
        updatedPending.delete(productId);

        return { ids: rollbackIds, pendingIds: updatedPending };
      });
      throw error;
    }
  },

  // Clear store on logout
  clear: () => {
    set({ ids: new Set(), pendingIds: new Set(), isInitialized: false });
  },
}));
