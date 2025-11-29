import { create } from 'zustand';

/**
 * Generation Status Store
 * This store tracks active generations across all features.
 * It's NOT persisted to localStorage - it lives in memory.
 * When a generation starts, it runs in the background even if user navigates away.
 */

export type FeatureType = 'flatlay' | 'onmodel' | 'mannequin' | 'backgroundchange';

export interface GenerationStatus {
  isGenerating: boolean;
  error: string | null;
  generatedImageUrl: string | null;
  startedAt: number | null;
}

interface GenerationStore {
  // Status for each feature
  flatlay: GenerationStatus;
  onmodel: GenerationStatus;
  mannequin: GenerationStatus;
  backgroundchange: GenerationStatus;
  
  // Actions
  startGeneration: (feature: FeatureType) => void;
  completeGeneration: (feature: FeatureType, imageUrl: string) => void;
  failGeneration: (feature: FeatureType, error: string) => void;
  resetGeneration: (feature: FeatureType) => void;
  getStatus: (feature: FeatureType) => GenerationStatus;
}

const initialStatus: GenerationStatus = {
  isGenerating: false,
  error: null,
  generatedImageUrl: null,
  startedAt: null,
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  flatlay: { ...initialStatus },
  onmodel: { ...initialStatus },
  mannequin: { ...initialStatus },
  backgroundchange: { ...initialStatus },
  
  startGeneration: (feature) => set({
    [feature]: {
      isGenerating: true,
      error: null,
      generatedImageUrl: null,
      startedAt: Date.now(),
    }
  }),
  
  completeGeneration: (feature, imageUrl) => set((state) => ({
    [feature]: {
      isGenerating: false,
      error: null,
      generatedImageUrl: imageUrl,
      startedAt: state[feature].startedAt,
    }
  })),
  
  failGeneration: (feature, error) => set((state) => ({
    [feature]: {
      isGenerating: false,
      error,
      generatedImageUrl: null,
      startedAt: state[feature].startedAt,
    }
  })),
  
  resetGeneration: (feature) => set({
    [feature]: { ...initialStatus }
  }),
  
  getStatus: (feature) => get()[feature],
}));

// Helper hook for components
export function useFeatureGeneration(feature: FeatureType) {
  const status = useGenerationStore((state) => state[feature]);
  const startGeneration = useGenerationStore((state) => state.startGeneration);
  const completeGeneration = useGenerationStore((state) => state.completeGeneration);
  const failGeneration = useGenerationStore((state) => state.failGeneration);
  const resetGeneration = useGenerationStore((state) => state.resetGeneration);
  
  return {
    ...status,
    startGeneration: () => startGeneration(feature),
    completeGeneration: (imageUrl: string) => completeGeneration(feature, imageUrl),
    failGeneration: (error: string) => failGeneration(feature, error),
    resetGeneration: () => resetGeneration(feature),
  };
}
