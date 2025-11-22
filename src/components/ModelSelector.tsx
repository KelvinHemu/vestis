import { useState, useEffect } from 'react';
import { ModelCard } from './model';
import modelService from '@/services/modelService';
import type { Model } from '@/types/model';

interface ModelSelectorProps {
  onModelSelect?: (modelId: string) => void;
  selectedModel?: string;
}

export function ModelSelector({ onModelSelect, selectedModel }: ModelSelectorProps) {
  // ============================================================================
  // State Management
  // ============================================================================
  const [activeCategory, setActiveCategory] = useState<'male' | 'female'>('female');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(selectedModel || null);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Fetch Models from API
  // ============================================================================
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await modelService.getModels();
        setModels(response.models);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
        setError(errorMessage);
        console.error('Error fetching models:', err);
        
        // If it's a session expired error, the apiClient will handle redirect
        // Otherwise show the error to the user
        if (!errorMessage.includes('Session expired') && !errorMessage.includes('login again')) {
          // Show user-friendly error
          setError('Unable to load models. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // ============================================================================
  // Handle Model Selection
  // ============================================================================
  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    if (onModelSelect) {
      onModelSelect(modelId);
    }
  };

  // ============================================================================
  // Filter Models by Active Category (male/female) and Active Status
  // ============================================================================
  const currentModels = models.filter(
    model => model.gender === activeCategory && model.status === 'active'
  );

  // ============================================================================
  // Render Component
  // ============================================================================
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        {/* Header Section - Will scroll */}
        <div className="space-y-4 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Select Your Model</h2>
          <p className="text-gray-600">Choose a model that best represents your brand and target audience.</p>
        </div>
        
        {/* Sticky Gender Selection - Sticks to top when scrolling */}
        <div className="sticky top-0 bg-white z-10 pb-4 pt-2 -mt-2">
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory('female')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                  activeCategory === 'female'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Female
              </button>
              <button
                onClick={() => setActiveCategory('male')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                  activeCategory === 'male'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Male
              </button>
            </div>
            {selectedModelId && (
              <button
                onClick={() => {
                  setSelectedModelId(null);
                  if (onModelSelect) {
                    onModelSelect('');
                  }
                }}
                className="py-1.5 px-4 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-gray-600 text-sm">Loading models...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Failed to load models</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Model Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 pb-8 pl-2">
              {currentModels.map((model) => {
                const mainImage = modelService.getMainImage(model) || '';
                const ageRange = modelService.formatAgeRange(model.age_range);
                
                return (
                  <ModelCard
                    key={model.id}
                    id={model.id.toString()}
                    name={model.name}
                    age={ageRange}
                    size="Standard" // Size is not in the new API response
                    image={mainImage}
                    isSelected={selectedModelId === model.id.toString()}
                    onClick={() => handleModelSelect(model.id.toString())}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && currentModels.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-gray-500 font-medium">No models available in this category.</p>
                <p className="text-gray-400 text-sm">Try selecting a different category.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
