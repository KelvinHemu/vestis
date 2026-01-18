"use client";

import { useState, useEffect, useRef } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { Steps } from './Steps';
import { OnModelUpload } from './OnModelUpload';
import { ModelSelector } from '@/features/models/components/ModelSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { OnModelPreviewPanel } from './OnModelPreviewPanel';
import { FloatingPromptInput } from './FloatingPromptInput';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import { InsufficientCreditsDialog } from '@/components/ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import { useOnModelGeneration } from '@/hooks/useOnModelGeneration';
import { useInvalidateGenerations } from '@/hooks/useGenerations';
import { useInvalidateOnModel } from '@/hooks/useOnModel';
import { useOnModelStore } from '@/contexts/featureStores';
import { chatService } from '@/services/chatService';
import type { ModelPhoto } from '@/types/onModel';
import type { Model } from '@/types/model';
import type { Background } from '@/types/background';
import modelService from '@/services/modelService';
import { getBackgroundById } from '@/services/backgroundService';
import { RotateCw } from 'lucide-react';
import AspectRatio from '@/components/shared/aspectRatio';
import Resolution from '@/components/shared/resolution';
import { FeatureEvents } from '@/utils/analytics';

export function OnModelPhotos() {

  // Get persisted state from store
  const {
    currentStep,
    maxUnlockedStep,
    photos,
    selectedModelId,
    selectedBackgroundId,
    prompt,
    isEditMode,
    generationHistory,
    aspectRatio,
    resolution,
    generatedImageUrl: storedGeneratedImageUrl,
    setCurrentStep,
    setMaxUnlockedStep,
    setPhotos,
    setSelectedModelId,
    setSelectedBackgroundId,
    setPrompt,
    setIsEditMode,
    setGenerationHistory,
    setAspectRatio,
    setResolution,
    setGeneratedImageUrl: setStoredGeneratedImageUrl,
    resetOnModel,
  } = useOnModelStore();

  // Local (non-persisted) state
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Cache invalidation hooks
  const invalidateGenerations = useInvalidateGenerations();
  const invalidateOnModel = useInvalidateOnModel();

  const {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateOnModel,
    resetGeneration,
    setGeneratedImageUrl,
    insufficientCredits,
  } = useOnModelGeneration();

  // Handle Start Over - reset all state
  const handleStartOver = () => {
    resetOnModel();
    resetGeneration();
  };

  // Sync generated image with store for persistence
  useEffect(() => {
    // Only sync if the URL is different from stored value to prevent infinite loop
    if (generatedImageUrl && generatedImageUrl !== storedGeneratedImageUrl) {
      setStoredGeneratedImageUrl(generatedImageUrl);
      setIsEditMode(true);
      // Invalidate caches to show new generation in history
      invalidateGenerations();
      invalidateOnModel();
    }
  }, [generatedImageUrl, storedGeneratedImageUrl, aspectRatio, setStoredGeneratedImageUrl, setIsEditMode, invalidateGenerations, invalidateOnModel]);

  // Restore generated image from store on mount
  useEffect(() => {
    if (storedGeneratedImageUrl && !generatedImageUrl) {
      setGeneratedImageUrl(storedGeneratedImageUrl);
    }
  }, []);

  // Fetch full model object when model ID changes
  useEffect(() => {
    const fetchModel = async () => {
      if (selectedModelId) {
        try {
          const model = await modelService.getModelById(parseInt(selectedModelId));
          setSelectedModel(model);
        } catch (error) {
          console.error('Error fetching model:', error);
        }
      } else {
        setSelectedModel(null);
      }
    };
    fetchModel();
  }, [selectedModelId]);

  // Fetch full background object when background ID changes
  useEffect(() => {
    const fetchBackground = async () => {
      if (selectedBackgroundId && typeof selectedBackgroundId === 'number') {
        try {
          const background = await getBackgroundById(selectedBackgroundId);
          setSelectedBackground(background || null);
        } catch (error) {
          console.error('Error fetching background:', error);
        }
      } else {
        setSelectedBackground(null);
      }
    };
    fetchBackground();
  }, [selectedBackgroundId]);

  const handleFileUpload = (index: number, file: File | null) => {
    console.log('handleFileUpload called with index:', index, 'file:', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('FileReader result:', result.substring(0, 50) + '...');
        setPhotos(prev => ({
          ...prev,
          [index]: result
        }));
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      // Remove photo if file is null
      setPhotos(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  // Helper function to convert aspect ratio string to CSS format
  const getAspectRatioValue = (ratio: string): string => {
    if (ratio === 'auto') return '3/4'; // Default to 3:4
    return ratio.replace(':', '/'); // Convert '16:9' to '16/9'
  };

  const steps = [
    'Upload Photos',
    'Select Models',
    'Select Background',
    'Preview & Generate'
  ];

  const handleGenerateImage = async () => {
    // Prevent double submission
    if (isGenerating) {
      console.log('⏳ Generation already in progress, ignoring duplicate request');
      return;
    }

    if (!selectedModelId) {
      console.error('Missing required fields');
      return;
    }

    // Capture prompt value before clearing
    const currentPrompt = prompt.trim();

    // Clear prompt immediately for instant UI feedback
    setPrompt('');

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    try {
      // If we're in edit mode and have a prompt, use chat service for editing
      if (isEditMode && currentPrompt && generatedImageUrl) {
        console.log('✏️ Editing image with chat service');
        const response = await chatService.editImage(
          generatedImageUrl,
          currentPrompt
        );

        // Chat service returns completed images directly, no need to poll
        if (response.imageUrl) {
          setGeneratedImageUrl(response.imageUrl);
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        return;
      }

      // Convert photos object to array of ModelPhoto
      // Backend expects id and image fields, id must be string
      const modelPhotos: ModelPhoto[] = Object.entries(photos).map(([id, image]) => ({
        id: id.toString(), // Ensure ID is string
        image,
      }));

      // Backend expects backgroundId as string (optional)
      const request = {
        photos: modelPhotos,
        modelId: selectedModelId,
        ...(selectedBackgroundId && { backgroundId: String(selectedBackgroundId) }), // Include only if selected
        ...(currentPrompt && { prompt: currentPrompt }), // Include prompt if not empty
        aspectRatio,
        resolution,
      };

      console.log('🚀 Generating on-model photos with request:', {
        photosCount: modelPhotos.length,
        modelId: request.modelId,
        backgroundId: request.backgroundId,
        photoIds: modelPhotos.map(p => p.id),
        hasPrompt: !!currentPrompt,
        aspectRatio,
        resolution,
      });

      await generateOnModel(request);
    } catch (error) {
      console.error('Error in handleGenerateImage:', error);
      // Error handling is done in the hook or chat service
    }
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Upload Photos
        return Object.keys(photos).length > 0;
      case 1: // Select Models
        return selectedModelId !== null;
      case 2: // Select Background
        return true; // Background is optional, always allow proceeding
      case 3: // Preview & Generate
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      // On the last step, trigger generation
      handleGenerateImage();
    } else if (canProceedToNextStep()) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxUnlockedStep(Math.max(maxUnlockedStep, nextStep));
    }
  };

  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImageUrl(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  const renderStepContent = () => {
    // Helper function to handle sample image selection
    const handleSelectSample = async (imageUrl: string) => {
      try {
        // Fetch the image and convert to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPhotos(prev => ({
            ...prev,
            [0]: base64
          }));
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading sample image:', error);
      }
    };

    switch (currentStep) {
      case 0:
        return (
          <>

            <OnModelUpload
              photos={photos}
              onFileUpload={handleFileUpload}
              onClear={() => setPhotos({})}
              onSelectSample={handleSelectSample}
              selectedSample={Object.keys(photos).length > 0 ? undefined : undefined}
            />
          </>
        );
      case 1:
        return (
          <div className="space-y-6">
            <ModelSelector
              selectedModel={selectedModelId || undefined}
              onModelSelect={(modelId) => setSelectedModelId(modelId)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <BackgroundSelector
              selectedBackground={selectedBackgroundId || undefined}
              onBackgroundSelect={(backgroundId) => setSelectedBackgroundId(backgroundId)}
            />
          </div>
        );
      case 3:
        const isLoading = isGenerating;
        return (
          <div className="space-y-6">

            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 sm:gap-4 md:gap-6">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <style>{`
                    @keyframes l4 {
                      to { width: 25px; aspect-ratio: 1; }
                    }
                    .custom-loader {
                      width: 60px;
                      aspect-ratio: 4;
                      --c: #000 90%, #0000;
                      background: 
                        radial-gradient(circle closest-side at left 6px top 50%, var(--c)),
                        radial-gradient(circle closest-side, var(--c)),
                        radial-gradient(circle closest-side at right 6px top 50%, var(--c));
                      background-size: 100% 100%;
                      background-repeat: no-repeat;
                      animation: l4 1s infinite alternate;
                    }
                  `}</style>
                  <div className="custom-loader"></div>
                </div>
              ) : generationError ? (
                <div className="text-center max-w-md">
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generation Failed</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{generationError}</p>
                    <button
                      onClick={resetGeneration}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <>
                  {/* Start Over button */}
                  <button
                    onClick={handleStartOver}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-medium transition-colors text-xs sm:text-sm"
                  >
                    Start Over
                  </button>

                  <div
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all shadow-xl animate-in fade-in duration-500 mx-auto cursor-pointer w-full max-w-[140px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[300px] xl:max-w-[340px] mb-20"
                    style={{ aspectRatio: getAspectRatioValue(aspectRatio) }}
                    onDoubleClick={() => setIsFullscreenOpen(true)}
                  >
                    <img
                      src={generatedImageUrl}
                      alt="Generated on-model"
                      className="w-full h-full object-cover"
                    />

                    {/* Image Feedback Actions */}
                    <ImageFeedbackActions
                      onUndo={handleUndoEdit}
                      onThumbsUp={() => console.log('Thumbs up')}
                      onThumbsDown={() => console.log('Thumbs down')}
                      showUndo={generationHistory.length > 0}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Review your selections and generate your on-model photos</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRightPanel = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Preview section - hidden on phone only */}
        <div className="hidden md:block">
          <OnModelPreviewPanel
            photos={Object.values(photos)}
            selectedModel={selectedModel}
            selectedBackground={selectedBackground}
          />
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Selected Items and Button at the bottom */}
        <div className="space-y-4 md:space-y-6">
          {/* Aspect Ratio Selector */}
          <div>
            <AspectRatio
              value={aspectRatio}
              onValueChange={setAspectRatio}
            />
          </div>

          {/* Resolution Selector */}
          <div>
            <Resolution
              value={resolution}
              onValueChange={setResolution}
            />
          </div>

          {/* Show Download and Regenerate buttons after image is generated */}
          {currentStep === 3 && generatedImageUrl && (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(generatedImageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'on-model-photo.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    // Track download event
                    FeatureEvents.downloadImage('on-model');
                  } catch (err) {
                    console.error('Failed to download image:', err);
                    alert('Failed to download image');
                  }
                }}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Download
              </button>
              <button
                onClick={async () => {
                  resetGeneration();
                  await handleGenerateImage();
                }}
                disabled={isGenerating}
                className="px-3 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate Image"
              >
                <RotateCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Show action button - hide only after image is generated */}
          {!(currentStep === 3 && generatedImageUrl) && (
            <div className="mt-auto pt-4 pb-4">
              {/* Show error if any */}
              {generationError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {generationError}
                </div>
              )}

              <button
                disabled={!canProceedToNextStep() || isGenerating}
                onClick={handleNextStep}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isGenerating
                  ? 'Generating...'
                  : currentStep === 3
                    ? 'Generate Image'
                    : 'Next Step'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainContent
      showBackButton={false}
    >
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={!!insufficientCredits}
        onClose={() => resetGeneration()}
        creditsAvailable={insufficientCredits?.available || 0}
        creditsRequired={insufficientCredits?.required || 1}
      />

      {/* Fullscreen Image Viewer */}
      {generatedImageUrl && (
        <FullscreenImageViewer
          isOpen={isFullscreenOpen}
          imageUrl={generatedImageUrl}
          onClose={() => setIsFullscreenOpen(false)}
          onDownload={async () => {
            try {
              const response = await fetch(generatedImageUrl);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob); const link = document.createElement('a');
              link.href = url;
              link.download = 'on-model-image.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              // Track download event
              FeatureEvents.downloadImage('on-model');
            } catch (err) {
              console.error('Failed to download image:', err);
              alert('Failed to download image');
            }
          }}
        />
      )}

      {/* Content Area with Left and Right Sections */}
      <div className="flex flex-col md:flex-row gap-0 h-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
        {/* Left Component - full width on phone, flex-1 on tablet+ */}
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] md:border-r-2 border-gray-300 dark:border-gray-700 m-0 overflow-y-auto relative min-h-0 pb-44 md:pb-0">
          <div className="border-b-2 border-gray-300 dark:border-gray-700">
            <Steps
              steps={steps}
              currentStep={currentStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={setCurrentStep}
            />
          </div>
          <div className="p-8">
            {renderStepContent()}
          </div>

          {/* Floating Input Bar - Only visible on step 3 (Preview & Generate) */}
          {currentStep === 3 && (
            <FloatingPromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes you'd like to make..." : "Add more details about your image (optional)..."}
              disabled={isGenerating}
            />
          )}
        </div>

        {/* Right Component - fixed bottom bar on phone, sidebar on tablet+ */}
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-80 lg:w-96 bg-white dark:bg-[#1A1A1A] p-4 sm:p-6 m-0 md:overflow-y-auto flex flex-col border-t-2 md:border-t-0 border-gray-300 dark:border-gray-700 shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
