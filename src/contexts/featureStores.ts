import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AspectRatioValue } from '../components/aspectRatio';
import type { ResolutionValue } from '../components/resolution';

/**
 * FlatLay Feature State
 */
interface FlatLayState {
  currentStep: number;
  maxUnlockedStep: number;
  selectionType: ('top' | 'bottom')[];
  topImages: { [key: number]: string };
  bottomImages: { [key: number]: string };
  selectedModel: string | null;
  selectedBackground: number | string | null;
  generatedImageUrl: string | null;
  additionalInfo: string;
  isEditMode: boolean;
  generationHistory: string[];
  aspectRatio: AspectRatioValue;
  resolution: ResolutionValue;
}

interface FlatLayActions {
  setCurrentStep: (step: number) => void;
  setMaxUnlockedStep: (step: number) => void;
  setSelectionType: (type: ('top' | 'bottom')[]) => void;
  setTopImages: (images: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setBottomImages: (images: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setSelectedModel: (model: string | null) => void;
  setSelectedBackground: (background: number | string | null) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  setAdditionalInfo: (info: string) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setGenerationHistory: (history: string[] | ((prev: string[]) => string[])) => void;
  addToGenerationHistory: (url: string) => void;
  setAspectRatio: (ratio: AspectRatioValue) => void;
  setResolution: (resolution: ResolutionValue) => void;
  resetFlatLay: () => void;
}

const initialFlatLayState: FlatLayState = {
  currentStep: 0,
  maxUnlockedStep: 0,
  selectionType: ['top'],
  topImages: {},
  bottomImages: {},
  selectedModel: null,
  selectedBackground: null,
  generatedImageUrl: null,
  additionalInfo: '',
  isEditMode: false,
  generationHistory: [],
  aspectRatio: 'auto',
  resolution: '2K',
};

export const useFlatLayStore = create<FlatLayState & FlatLayActions>()(
  persist(
    (set) => ({
      ...initialFlatLayState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setMaxUnlockedStep: (step) => set({ maxUnlockedStep: step }),
      setSelectionType: (type) => set({ selectionType: type }),
      setTopImages: (images) => set((state) => ({ 
        topImages: typeof images === 'function' ? images(state.topImages) : images 
      })),
      setBottomImages: (images) => set((state) => ({ 
        bottomImages: typeof images === 'function' ? images(state.bottomImages) : images 
      })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setSelectedBackground: (background) => set({ selectedBackground: background }),
      setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
      setAdditionalInfo: (info) => set({ additionalInfo: info }),
      setIsEditMode: (isEdit) => set({ isEditMode: isEdit }),
      setGenerationHistory: (history) => set((state) => ({ 
        generationHistory: typeof history === 'function' ? history(state.generationHistory) : history 
      })),
      addToGenerationHistory: (url) => set((state) => ({ 
        generationHistory: [...state.generationHistory, url] 
      })),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setResolution: (resolution) => set({ resolution: resolution }),
      resetFlatLay: () => set(initialFlatLayState),
    }),
    {
      name: 'flatlay-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        maxUnlockedStep: state.maxUnlockedStep,
        selectionType: state.selectionType,
        topImages: state.topImages,
        bottomImages: state.bottomImages,
        selectedModel: state.selectedModel,
        selectedBackground: state.selectedBackground,
        generatedImageUrl: state.generatedImageUrl,
        isEditMode: state.isEditMode,
        generationHistory: state.generationHistory,
        aspectRatio: state.aspectRatio,
        resolution: state.resolution,
      }),
    }
  )
);

/**
 * OnModel Feature State
 */
interface OnModelState {
  currentStep: number;
  maxUnlockedStep: number;
  photos: { [key: number]: string };
  selectedModelId: string | null;
  selectedBackgroundId: number | string | null;
  prompt: string;
  isEditMode: boolean;
  generationHistory: string[];
  aspectRatio: AspectRatioValue;
  resolution: ResolutionValue;
  generatedImageUrl: string | null;
}

interface OnModelActions {
  setCurrentStep: (step: number) => void;
  setMaxUnlockedStep: (step: number) => void;
  setPhotos: (photos: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setSelectedModelId: (modelId: string | null) => void;
  setSelectedBackgroundId: (backgroundId: number | string | null) => void;
  setPrompt: (prompt: string) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setGenerationHistory: (history: string[] | ((prev: string[]) => string[])) => void;
  addToGenerationHistory: (url: string) => void;
  setAspectRatio: (ratio: AspectRatioValue) => void;
  setResolution: (resolution: ResolutionValue) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  resetOnModel: () => void;
}

const initialOnModelState: OnModelState = {
  currentStep: 0,
  maxUnlockedStep: 0,
  photos: {},
  selectedModelId: null,
  selectedBackgroundId: null,
  prompt: '',
  isEditMode: false,
  generationHistory: [],
  aspectRatio: 'auto',
  resolution: '2K',
  generatedImageUrl: null,
};

export const useOnModelStore = create<OnModelState & OnModelActions>()(
  persist(
    (set) => ({
      ...initialOnModelState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setMaxUnlockedStep: (step) => set({ maxUnlockedStep: step }),
      setPhotos: (photos) => set((state) => ({ 
        photos: typeof photos === 'function' ? photos(state.photos) : photos 
      })),
      setSelectedModelId: (modelId) => set({ selectedModelId: modelId }),
      setSelectedBackgroundId: (backgroundId) => set({ selectedBackgroundId: backgroundId }),
      setPrompt: (prompt) => set({ prompt: prompt }),
      setIsEditMode: (isEdit) => set({ isEditMode: isEdit }),
      setGenerationHistory: (history) => set((state) => ({ 
        generationHistory: typeof history === 'function' ? history(state.generationHistory) : history 
      })),
      addToGenerationHistory: (url) => set((state) => ({ 
        generationHistory: [...state.generationHistory, url] 
      })),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setResolution: (resolution) => set({ resolution: resolution }),
      setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
      resetOnModel: () => set(initialOnModelState),
    }),
    {
      name: 'onmodel-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        maxUnlockedStep: state.maxUnlockedStep,
        photos: state.photos,
        selectedModelId: state.selectedModelId,
        selectedBackgroundId: state.selectedBackgroundId,
        isEditMode: state.isEditMode,
        generationHistory: state.generationHistory,
        aspectRatio: state.aspectRatio,
        resolution: state.resolution,
        generatedImageUrl: state.generatedImageUrl,
      }),
    }
  )
);

/**
 * Mannequin Feature State
 */
interface MannequinState {
  currentStep: number;
  maxUnlockedStep: number;
  selectionType: ('top' | 'bottom')[];
  topImages: { [key: number]: string };
  bottomImages: { [key: number]: string };
  selectedModel: string | null;
  selectedBackground: number | string | null;
  generatedImageUrl: string | null;
  additionalInfo: string;
  isEditMode: boolean;
  generationHistory: string[];
  aspectRatio: AspectRatioValue;
  resolution: ResolutionValue;
}

interface MannequinActions {
  setCurrentStep: (step: number) => void;
  setMaxUnlockedStep: (step: number) => void;
  setSelectionType: (type: ('top' | 'bottom')[]) => void;
  setTopImages: (images: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setBottomImages: (images: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setSelectedModel: (model: string | null) => void;
  setSelectedBackground: (background: number | string | null) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  setAdditionalInfo: (info: string) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setGenerationHistory: (history: string[] | ((prev: string[]) => string[])) => void;
  addToGenerationHistory: (url: string) => void;
  setAspectRatio: (ratio: AspectRatioValue) => void;
  setResolution: (resolution: ResolutionValue) => void;
  resetMannequin: () => void;
}

const initialMannequinState: MannequinState = {
  currentStep: 0,
  maxUnlockedStep: 0,
  selectionType: ['top', 'bottom'],
  topImages: {},
  bottomImages: {},
  selectedModel: null,
  selectedBackground: null,
  generatedImageUrl: null,
  additionalInfo: '',
  isEditMode: false,
  generationHistory: [],
  aspectRatio: 'auto',
  resolution: '2K',
};

export const useMannequinStore = create<MannequinState & MannequinActions>()(
  persist(
    (set) => ({
      ...initialMannequinState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setMaxUnlockedStep: (step) => set({ maxUnlockedStep: step }),
      setSelectionType: (type) => set({ selectionType: type }),
      setTopImages: (images) => set((state) => ({ 
        topImages: typeof images === 'function' ? images(state.topImages) : images 
      })),
      setBottomImages: (images) => set((state) => ({ 
        bottomImages: typeof images === 'function' ? images(state.bottomImages) : images 
      })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setSelectedBackground: (background) => set({ selectedBackground: background }),
      setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
      setAdditionalInfo: (info) => set({ additionalInfo: info }),
      setIsEditMode: (isEdit) => set({ isEditMode: isEdit }),
      setGenerationHistory: (history) => set((state) => ({ 
        generationHistory: typeof history === 'function' ? history(state.generationHistory) : history 
      })),
      addToGenerationHistory: (url) => set((state) => ({ 
        generationHistory: [...state.generationHistory, url] 
      })),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setResolution: (resolution) => set({ resolution: resolution }),
      resetMannequin: () => set(initialMannequinState),
    }),
    {
      name: 'mannequin-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        maxUnlockedStep: state.maxUnlockedStep,
        selectionType: state.selectionType,
        topImages: state.topImages,
        bottomImages: state.bottomImages,
        selectedModel: state.selectedModel,
        selectedBackground: state.selectedBackground,
        generatedImageUrl: state.generatedImageUrl,
        isEditMode: state.isEditMode,
        generationHistory: state.generationHistory,
        aspectRatio: state.aspectRatio,
        resolution: state.resolution,
      }),
    }
  )
);

/**
 * BackgroundChange Feature State
 */
interface BackgroundChangeState {
  currentStep: number;
  maxUnlockedStep: number;
  photos: { [key: number]: string };
  selectedBackgroundId: number | string | null;
  additionalInfo: string;
  isEditMode: boolean;
  generationHistory: string[];
  aspectRatio: AspectRatioValue;
  resolution: ResolutionValue;
  generatedImageUrl: string | null;
}

interface BackgroundChangeActions {
  setCurrentStep: (step: number) => void;
  setMaxUnlockedStep: (step: number) => void;
  setPhotos: (photos: { [key: number]: string } | ((prev: { [key: number]: string }) => { [key: number]: string })) => void;
  setSelectedBackgroundId: (backgroundId: number | string | null) => void;
  setAdditionalInfo: (info: string) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setGenerationHistory: (history: string[] | ((prev: string[]) => string[])) => void;
  addToGenerationHistory: (url: string) => void;
  setAspectRatio: (ratio: AspectRatioValue) => void;
  setResolution: (resolution: ResolutionValue) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  resetBackgroundChange: () => void;
}

const initialBackgroundChangeState: BackgroundChangeState = {
  currentStep: 0,
  maxUnlockedStep: 0,
  photos: {},
  selectedBackgroundId: null,
  additionalInfo: '',
  isEditMode: false,
  generationHistory: [],
  aspectRatio: 'auto',
  resolution: '2K',
  generatedImageUrl: null,
};

export const useBackgroundChangeStore = create<BackgroundChangeState & BackgroundChangeActions>()(
  persist(
    (set) => ({
      ...initialBackgroundChangeState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setMaxUnlockedStep: (step) => set({ maxUnlockedStep: step }),
      setPhotos: (photos) => set((state) => ({ 
        photos: typeof photos === 'function' ? photos(state.photos) : photos 
      })),
      setSelectedBackgroundId: (backgroundId) => set({ selectedBackgroundId: backgroundId }),
      setAdditionalInfo: (info) => set({ additionalInfo: info }),
      setIsEditMode: (isEdit) => set({ isEditMode: isEdit }),
      setGenerationHistory: (history) => set((state) => ({ 
        generationHistory: typeof history === 'function' ? history(state.generationHistory) : history 
      })),
      addToGenerationHistory: (url) => set((state) => ({ 
        generationHistory: [...state.generationHistory, url] 
      })),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setResolution: (resolution) => set({ resolution: resolution }),
      setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
      resetBackgroundChange: () => set(initialBackgroundChangeState),
    }),
    {
      name: 'backgroundchange-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        maxUnlockedStep: state.maxUnlockedStep,
        photos: state.photos,
        selectedBackgroundId: state.selectedBackgroundId,
        isEditMode: state.isEditMode,
        generationHistory: state.generationHistory,
        aspectRatio: state.aspectRatio,
        resolution: state.resolution,
        generatedImageUrl: state.generatedImageUrl,
      }),
    }
  )
);
