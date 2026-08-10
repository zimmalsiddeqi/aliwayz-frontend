import { create } from 'zustand';

const useSearchStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  query:       '',
  filters:     {
    category_id:       undefined,
    min_price:         undefined,
    max_price:         undefined,
    condition:         undefined,
    sort:              'relevance',
    city:              undefined,
    verified_sellers:  undefined,
    min_seller_rating: undefined,
  },
  suggestions:    [],
  recentSearches: [],
  isOpen:         false,

  // ── Actions ────────────────────────────────────────────────
  setQuery: (query) => set({ query }),

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        category_id:       undefined,
        min_price:         undefined,
        max_price:         undefined,
        condition:         undefined,
        sort:              'relevance',
        city:              undefined,
        verified_sellers:  undefined,
        min_seller_rating: undefined,
      },
    });
  },

  setSuggestions: (suggestions) => set({ suggestions }),

  setRecentSearches: (searches) => set({ recentSearches: searches }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    set((state) => ({
      recentSearches: [
        trimmed,
        ...state.recentSearches.filter((s) => s !== trimmed),
      ].slice(0, 10),
    }));
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  openSearch:  () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, suggestions: [] }),

  getActiveFilterCount: () => {
    const filters = get().filters;
    return Object.values(filters).filter(
      (v) => v !== undefined && v !== 'relevance'
    ).length;
  },
}));

export default useSearchStore;