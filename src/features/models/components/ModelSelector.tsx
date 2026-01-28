"use client";

/**
 * ModelSelector - Select models for generation
 * 
 * Shows all available models (platform + custom) in a unified grid.
 * Custom models from the business are mixed in with platform models.
 */

import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { ModelCard } from './model';
import { useModelsByGender } from '@/hooks/useModels';
import { useCustomModelsByGender, useDeleteCustomModel } from '@/hooks/useCustomModels';
import { useModelStore } from '@/contexts/modelStore';
import modelService from '@/services/modelService';
import type { Model, CustomModel } from '@/types/model';
import { Button } from '@/components/ui/button';

// ============================================================================
// Props Interface
// ============================================================================

interface ModelSelectorProps {
  onModelSelect?: (modelId: string) => void;
  selectedModel?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ModelSelector({ onModelSelect, selectedModel }: ModelSelectorProps) {
  const router = useRouter();

  // ============================================================================
  // State Management with Zustand & React Query
  // ============================================================================
  const { 
    activeCategory, 
    setActiveCategory, 
    selectedModelId,
    selectModel,
    clearSelection,
    toggleFavorite,
    isFavorite 
  } = useModelStore();
  
  // Use selected model from props if provided, otherwise use store
  const effectiveSelectedId = selectedModel || selectedModelId;
  
  // Convert category to gender filter for the hooks
  const genderFilter = activeCategory === 'All' ? undefined : activeCategory;
  
  // Platform models (from API)
  const { data: platformModels, isLoading: isPlatformLoading, error: platformError } = useModelsByGender(genderFilter);
  
  // Custom models (business-specific)
  const { data: customModels, isLoading: isCustomLoading } = useCustomModelsByGender(genderFilter as 'male' | 'female' | undefined);
  
  // Delete mutation for custom models
  const deleteMutation = useDeleteCustomModel();

  // Combined loading state
  const isLoading = isPlatformLoading || isCustomLoading;
  const error = platformError;

  // ============================================================================
  // Handle Model Selection
  // ============================================================================
  const handleModelSelect = (modelId: string, isCustom: boolean = false) => {
    // Prefix custom model IDs to differentiate them
    const fullId = isCustom ? `custom_${modelId}` : modelId;
    selectModel(fullId);
    if (onModelSelect) {
      onModelSelect(fullId);
    }
  };

  // ============================================================================
  // Handle Clear Selection
  // ============================================================================
  const handleClearSelection = () => {
    clearSelection();
    if (onModelSelect) {
      onModelSelect('');
    }
  };

  // ============================================================================
  // Handle Delete Custom Model
  // ============================================================================
  const handleDeleteCustomModel = async (modelId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the model
    
    if (window.confirm('Remove this model? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(modelId);
      } catch (error) {
        console.error('Failed to delete custom model:', error);
      }
    }
  };

  // ============================================================================
  // Handle Preview - Navigate to Model Profile Page
  // ============================================================================
  const handlePreviewOpen = (model: Model) => {
    router.push(`/models/${model.id}`);
  };

  // ============================================================================
  // Filter Models by Active Status
  // ============================================================================
  const currentPlatformModels = platformModels.filter(model => model.status === 'active');

  // ============================================================================
  // Render Component
  // ============================================================================
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        {/* Header Section - Hidden on mobile since Steps shows the name */}
        <div className="hidden md:block space-y-4 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Select Your Model</h2>
          <p className="text-gray-600 dark:text-gray-400">Choose a model that best represents your brand and target audience.</p>
        </div>
        
        {/* Sticky Gender Selection - Sticks to top when scrolling */}
        <div className="sticky top-0 bg-white dark:bg-[#1A1A1A] z-10 pb-4 pt-2 -mt-2">
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory('female')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                  activeCategory === 'female'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Female
              </button>
              <button
                onClick={() => setActiveCategory('male')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                  activeCategory === 'male'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Male
              </button>
            </div>
            
            <div className="flex gap-2">
              {/* Add Model Button */}
              <Button
                onClick={() => router.push('/add-model')}
                size="sm"
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Model
              </Button>
              
              {effectiveSelectedId && (
                <button
                  onClick={handleClearSelection}
                  className="py-1.5 px-4 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading models...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Failed to load models</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* Models Grid - Platform + Custom Models Mixed */}
          {/* ================================================================ */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-4 pb-8 pl-0 sm:pl-2">
              {/* Custom Models First (business's own models) */}
              {customModels.map((model: CustomModel) => {
                const modelIdStr = `custom_${model.id}`;
                
                return (
                  <div key={`custom-${model.id}`} className="relative group">
                    <ModelCard
                      id={modelIdStr}
                      name={model.name}
                      age=""
                      size=""
                      image={model.image_url}
                      isSelected={effectiveSelectedId === modelIdStr}
                      isFavorite={false}
                      onClick={() => handleModelSelect(model.id.toString(), true)}
                      onFavorite={() => {}}
                      onPreview={() => {}}
                      showDetails={false}
                    />
                    
                    {/* Delete Button - appears on hover */}
                    <button
                      onClick={(e) => handleDeleteCustomModel(model.id, e)}
                      disabled={deleteMutation.isPending}
                      className="
                        absolute top-2 right-2 z-10
                        w-8 h-8 rounded-full
                        bg-red-500 hover:bg-red-600 text-white
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        shadow-lg
                      "
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {/* Platform Models */}
              {currentPlatformModels.map((model) => {
                const mainImage = modelService.getMainImage(model) || '';
                const ageRange = modelService.formatAgeRange(model.age_range);
                const modelIdStr = model.id.toString();
                
                return (
                  <ModelCard
                    key={model.id}
                    id={modelIdStr}
                    name={model.name}
                    age={ageRange}
                    size="Standard"
                    image={mainImage}
                    isSelected={effectiveSelectedId === modelIdStr}
                    isFavorite={isFavorite(modelIdStr)}
                    onClick={() => handleModelSelect(modelIdStr, false)}
                    onFavorite={() => toggleFavorite(modelIdStr)}
                    onPreview={() => handlePreviewOpen(model)}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && currentPlatformModels.length === 0 && customModels.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No models available in this category.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Try selecting a different category or add your own model.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
