"use client";

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ModelCard } from './model';
import { useModelsByGender } from '@/hooks/useModels';
import { useModelStore } from '@/contexts/modelStore';
import modelService from '@/services/modelService';
import type { Model } from '@/types/model';
import { Button } from '@/components/ui/button';

// ============================================================================
// ModelsPage - Shows all available models in a grid
// ============================================================================

export function ModelsPage() {
  const router = useRouter();

  // ============================================================================
  // State Management with Zustand & React Query
  // ============================================================================
  const { activeCategory, setActiveCategory, toggleFavorite, isFavorite } = useModelStore();

  // Convert 'All' to undefined for the hook, or use lowercase gender
  const genderFilter = activeCategory === 'All' ? undefined : activeCategory;
  const { data: models, isLoading, error } = useModelsByGender(genderFilter);

  // ============================================================================
  // Handle Preview - Navigate to Model Profile Page
  // ============================================================================
  const handlePreviewOpen = (model: Model) => {
    router.push(`/models/${model.id}`);
  };

  // ============================================================================
  // Filter Models by Active Status
  // ============================================================================
  const currentModels = models.filter(model => model.status === 'active');

  // ============================================================================
  // Render Component
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Gender Selection */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory('female')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeCategory === 'female'
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              Female Models
            </button>
            <button
              onClick={() => setActiveCategory('male')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeCategory === 'male'
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              Male Models
            </button>
          </div>

          <Button
            onClick={() => router.push('/add-model')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </Button>
        </div>

        {/* Content Section */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading models...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-red-800 dark:text-red-200">Failed to load models</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Model Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {currentModels.map((model) => {
                const mainImage = modelService.getMainImage(model) || '';
                const ageRange = modelService.getModelAge(model);
                const modelIdStr = model.id.toString();

                return (
                  <ModelCard
                    key={model.id}
                    id={modelIdStr}
                    name={model.name}
                    age={ageRange}
                    size="Standard"
                    image={mainImage}
                    isSelected={false}
                    isFavorite={isFavorite(modelIdStr)}
                    onClick={() => router.push(`/models/${model.id}`)}
                    onFavorite={() => toggleFavorite(modelIdStr)}
                    onPreview={() => handlePreviewOpen(model)}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && currentModels.length === 0 && (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No models available in this category.</p>
                <p className="text-gray-400 dark:text-gray-500">Try selecting a different category.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
