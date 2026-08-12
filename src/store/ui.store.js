import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // ── Theme ────────────────────────────────────────────────
      theme: 'light', // 'dark' | 'light'

      // ── Sidebar ──────────────────────────────────────────────
      sidebarOpen:       false,
      mobileSidebarOpen: false,

      // ── Modals ───────────────────────────────────────────────
      activeModal: null,
      modalData:   null,

      // ── Loading ──────────────────────────────────────────────
      globalLoading: false,

      // ── Search ───────────────────────────────────────────────
      searchOpen: false,

      // ── Actions ──────────────────────────────────────────────
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleSidebar:       () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar:        () => set({ sidebarOpen: false }),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
      closeMobileSidebar:  () => set({ mobileSidebarOpen: false }),

      openModal:  (id, data = null) => set({ activeModal: id, modalData: data }),
      closeModal: ()                => set({ activeModal: null, modalData: null }),

      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      openSearch:   () => set({ searchOpen: true }),
      closeSearch:  () => set({ searchOpen: false }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
    }),
    {
      name: 'aliwayz-ui-prefs',
      version: 1, // Bump version to force reset from cached 'dark' to default 'light'
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

/**
 * Apply theme class to document root
 */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
  root.style.colorScheme = theme;
}

// ─────────────────────────────────────────
// Initialize theme on app load
// ─────────────────────────────────────────
if (typeof window !== 'undefined') {
  const savedTheme = useUIStore.getState().theme;
  applyTheme(savedTheme);
}

export default useUIStore;