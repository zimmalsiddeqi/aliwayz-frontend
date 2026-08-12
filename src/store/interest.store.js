import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_SCORE = 100;
const DECAY_FACTOR = 0.9;

const useInterestStore = create(
  persist(
    (set, get) => ({
      categoryScores: {}, // { category_id: score }

      logView: (categoryId) => {
        if (!categoryId) return;
        const currentScores = get().categoryScores;
        const currentScore = currentScores[categoryId] || 0;
        
        set({
          categoryScores: {
            ...currentScores,
            [categoryId]: Math.min(currentScore + 1, MAX_SCORE),
          }
        });
      },

      logFavorite: (categoryId) => {
        if (!categoryId) return;
        const currentScores = get().categoryScores;
        const currentScore = currentScores[categoryId] || 0;
        
        set({
          categoryScores: {
            ...currentScores,
            [categoryId]: Math.min(currentScore + 5, MAX_SCORE),
          }
        });
      },

      decayScores: () => {
        const currentScores = get().categoryScores;
        const newScores = {};
        let hasChanges = false;

        Object.entries(currentScores).forEach(([catId, score]) => {
          const decayed = Math.floor(score * DECAY_FACTOR);
          if (decayed > 0) {
            newScores[catId] = decayed;
          }
          if (decayed !== score) hasChanges = true;
        });

        if (hasChanges) {
          set({ categoryScores: newScores });
        }
      },

      getTopCategories: (limit = 2) => {
        const scores = get().categoryScores;
        return Object.entries(scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([catId]) => catId);
      },
    }),
    {
      name: 'aliwayz-interest-profile',
    }
  )
);

export default useInterestStore;
