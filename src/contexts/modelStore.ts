/**
 * Zustand store for Model UI state
 * 
 * This store manages:
 * - Selected model ID for the current session
 * - Favorite model IDs (persisted to localStorage)
 * - Active category filter
 * 
 * Note: Model DATA is managed by React Query in useModels.ts
 * This store only handles UI state that needs persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================
interface ModelState {
  // Currently selected model (for generating with a specific model)
  selectedModelId: string | null;
  
  // Favorited model IDs (persisted)
  favoriteModelIds: string[];
  
  // Active category filter on the models page
  activeCategory: string;
}

interface ModelActions {
  // Selection actions
  selectModel: (modelId: string) => void;
  clearSelection: () => void;
  
  // Favorites actions
  toggleFavorite: (modelId: string) => void;
  isFavorite: (modelId: string) => boolean;
  
  // Category actions
  setActiveCategory: (category: string) => void;
  
  // Reset
  reset: () => void;
}

type ModelStore = ModelState & ModelActions;

// ============================================================================
// Initial State
// ============================================================================
const initialState: ModelState = {
  selectedModelId: null,
  favoriteModelIds: [],
  activeCategory: 'All',
};

// ============================================================================
// Store
// ============================================================================
export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Selection
      selectModel: (modelId: string) => {
        set({ selectedModelId: modelId });
      },

      clearSelection: () => {
        set({ selectedModelId: null });
      },

      // Favorites
      toggleFavorite: (modelId: string) => {
        const { favoriteModelIds } = get();
        const isFav = favoriteModelIds.includes(modelId);
        
        set({
          favoriteModelIds: isFav
            ? favoriteModelIds.filter(id => id !== modelId)
            : [...favoriteModelIds, modelId],
        });
      },

      isFavorite: (modelId: string) => {
        return get().favoriteModelIds.includes(modelId);
      },

      // Category
      setActiveCategory: (category: string) => {
        set({ activeCategory: category });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'vestis-model-store',
      // Only persist favorites and category, not selection
      partialize: (state) => ({
        favoriteModelIds: state.favoriteModelIds,
        activeCategory: state.activeCategory,
      }),
    }
  )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================
export const selectSelectedModelId = (state: ModelStore) => state.selectedModelId;
export const selectFavoriteModelIds = (state: ModelStore) => state.favoriteModelIds;
export const selectActiveCategory = (state: ModelStore) => state.activeCategory;
