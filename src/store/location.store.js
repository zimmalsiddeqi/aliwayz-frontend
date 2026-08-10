import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLocationStore = create(
  persist(
    (set, get) => ({
      // User location
      lat:       null,
      lng:       null,
      city:      null,
      state:     null,
      zip:       null,
      isLocated: false,

      // Radius preference
      radiusMiles: 25, // default 25 miles

      // Loading states
      isDetecting: false,
      error:       null,

      // ── Actions ─────────────────────────────────
      setLocation: ({ lat, lng, city, state, zip }) => {
        set({
          lat,
          lng,
          city:      city || null,
          state:     state || null,
          zip:       zip || null,
          isLocated: true,
          error:     null,
        });
      },

      setRadius: (miles) => set({ radiusMiles: miles }),

      setDetecting: (val) => set({ isDetecting: val }),

      setError: (error) => set({ error, isDetecting: false }),

      clearLocation: () =>
        set({
          lat:       null,
          lng:       null,
          city:      null,
          state:     null,
          zip:       null,
          isLocated: false,
          error:     null,
        }),

      // ── Computed ────────────────────────────────
      getRadiusKm: () => {
        const { radiusMiles } = get();
        return radiusMiles * 1.60934;
      },

      getDisplayLocation: () => {
        const { city, state, zip } = get();
        if (city && state) return `${city}, ${state}`;
        if (city)          return city;
        if (zip)           return zip;
        return null;
      },
    }),
    {
      name: 'aliwayz-location',
      partialize: (state) => ({
        lat:         state.lat,
        lng:         state.lng,
        city:        state.city,
        state:       state.state,
        zip:         state.zip,
        isLocated:   state.isLocated,
        radiusMiles: state.radiusMiles,
      }),
    }
  )
);

export default useLocationStore;