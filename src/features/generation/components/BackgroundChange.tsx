"use client";

import { useState, useEffect } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { Steps } from './Steps';
import { BackgroundChangeUpload } from './BackgroundChangeUpload';
import { BackgroundSelector } from './BackgroundSelector';
import { BackgroundChangePreviewPanel } from './BackgroundChangePreviewPanel';
import { FloatingPromptInput } from './FloatingPromptInput';
import { BackgroundChangePreview } from './BackgroundChangePreview';
import { InsufficientCreditsDialog } from '@/components/ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import { useBackgroundChange } from '@/hooks/useBackgroundChange';
import { useInvalidateGenerations } from '@/hooks/useGenerations';
import { useInvalidateBackgroundChange } from '@/hooks/useBackgroundChangeQuery';
import { useBackgroundChangeStore } from '@/contexts/featureStores';
import type { BackgroundChangePhoto } from '@/types/backgroundChange';
import type { Background } from '@/types/background';
import { getBackgroundById } from '@/services/backgroundService';
import { RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFlatLayStore } from '@/contexts/featureStores';

export function BackgroundChange() {
  // Get persisted state from store
  const {
    currentStep,
    maxUnlockedStep,
    photos,
    selectedBackgroundId,
    additionalInfo,
    isEditMode,
    generationHistory,
    generatedImageUrl: storedGeneratedImageUrl,
    setCurrentStep,
    setMaxUnlockedStep,
    setPhotos,
    setSelectedBackgroundId,
    setAdditionalInfo,
    setIsEditMode,
    setGenerationHistory,
    setGeneratedImageUrl: setStoredGeneratedImageUrl,
    resetBackgroundChange,
  } = useBackgroundChangeStore();

  // Use shared quality settings from Profile (same as FlatLay & OnModel)
  const { aspectRatio, resolution } = useFlatLayStore();

  // Local (non-persisted) state
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Cache invalidation hooks
  const invalidateGenerations = useInvalidateGenerations();
  const invalidateBackgroundChangeCache = useInvalidateBackgroundChange();

  // Helper function to convert aspect ratio string to CSS format
  const getAspectRatioValue = (ratio: string): string => {
    if (ratio === 'auto') return '3/4'; // Default to 3:4
    return ratio.replace(':', '/'); // Convert '16:9' to '16/9'
  };

  const {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateBackgroundChange,
    resetGeneration,
    setGeneratedImageUrl,
    insufficientCredits,
  } = useBackgroundChange();

  // Handle Start Over - reset all state
  const handleStartOver = () => {
    resetBackgroundChange();
    resetGeneration();
  };

  // Sync generated image with store for persistence
  useEffect(() => {
    if (generatedImageUrl) {
      setStoredGeneratedImageUrl(generatedImageUrl);
      setIsEditMode(true);
      setAdditionalInfo('');
      // Invalidate caches to show new generation in history
      invalidateGenerations();
      invalidateBackgroundChangeCache();
    }
  }, [generatedImageUrl]);

  // Restore generated image from store on mount
  useEffect(() => {
    if (storedGeneratedImageUrl && !generatedImageUrl) {
      setGeneratedImageUrl(storedGeneratedImageUrl);
    }
  }, []);

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

  const steps = [
    'Upload Photos',
    'Select Background',
    'Preview & Generate'
  ];

  const handleGenerateImage = async () => {
    if (!selectedBackgroundId) {
      console.error('Missing background selection');
      return;
    }

    // Convert photos object to array of BackgroundChangePhoto
    const backgroundChangePhotos: BackgroundChangePhoto[] = Object.entries(photos).map(([id, image]) => ({
      id: id.toString(),
      image,
    }));

    const request = {
      photos: backgroundChangePhotos,
      backgroundId: String(selectedBackgroundId),
      ...(additionalInfo.trim() && { prompt: additionalInfo.trim() }), // Include prompt if not empty
      aspectRatio,
      resolution,
    };

    console.log('🚀 Generating background change with request:', {
      photosCount: backgroundChangePhotos.length,
      backgroundId: request.backgroundId,
      photoIds: backgroundChangePhotos.map(p => p.id),
      hasPrompt: !!additionalInfo.trim(),
      aspectRatio,
      resolution,
    });

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    await generateBackgroundChange(request);

    // Enable edit mode and clear prompt after generation
    setIsEditMode(true);
    setAdditionalInfo('');

    // Invalidate caches to show new generation in history
    invalidateGenerations();
    invalidateBackgroundChangeCache();
  };

  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImageUrl(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSelectHistory = (imageUrl: string, index: number) => {
    if (!generatedImageUrl) return;
    const allImages = [...generationHistory, generatedImageUrl];
    const newHistory = allImages.filter((_, i) => i !== index);
    setGeneratedImageUrl(imageUrl);
    setGenerationHistory(newHistory);
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Upload Photos
        return Object.keys(photos).length > 0;
      case 1: // Select Background
        return selectedBackgroundId !== null;
      case 2: // Preview & Generate
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      // On the last step, trigger generation
      handleGenerateImage();
    } else if (canProceedToNextStep()) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxUnlockedStep(Math.max(maxUnlockedStep, nextStep));
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
          <BackgroundChangeUpload
            photos={photos}
            onFileUpload={handleFileUpload}
            onClear={() => setPhotos({})}
            onSelectSample={handleSelectSample}
          />
        );
      case 1:
        return (
          <div className="space-y-6">
            <BackgroundSelector
              selectedBackground={selectedBackgroundId || undefined}
              onBackgroundSelect={(backgroundId) => setSelectedBackgroundId(backgroundId)}
            />
          </div>
        );
      case 2:
        return (
          <BackgroundChangePreview
            isGenerating={isGenerating}
            generationError={generationError}
            generatedImageUrl={generatedImageUrl}
            generationHistory={generationHistory}
            onReset={resetGeneration}
            onUndo={handleUndoEdit}
            onStartOver={handleStartOver}
            onSelectHistory={handleSelectHistory}
            aspectRatio={getAspectRatioValue(aspectRatio)}
            onImageDoubleClick={() => setIsFullscreenOpen(true)}
            photos={photos}
            selectedBackground={selectedBackground}
          />
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
          <BackgroundChangePreviewPanel
            photos={Object.values(photos)}
            selectedBackground={selectedBackground}
          />
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Selected Items and Button at the bottom */}
        <div className="space-y-4 md:space-y-6">
          {/* Show Download and Regenerate buttons after image is generated */}
          {currentStep === 2 && generatedImageUrl && (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(generatedImageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'background-change.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Failed to download image:', err);
                    alert('Failed to download image');
                  }
                }}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Download
              </button>
              <button
                onClick={async () => {
                  resetGeneration();
                  await handleGenerateImage();
                }}
                disabled={isGenerating}
                className="px-3 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate Image"
              >
                <RotateCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Show action button - hide only after image is generated */}
          {!(currentStep === 2 && generatedImageUrl) && (
            <div className="mt-auto pt-4 pb-4">
              {/* Show error if any */}
              {generationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {generationError}
                </div>
              )}

              <button
                disabled={!canProceedToNextStep() || isGenerating}
                onClick={handleNextStep}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGenerating
                  ? 'Generating...'
                  : currentStep === 2
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
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'background-change.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
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
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] md:border-r-2 border-gray-300 dark:border-gray-700 m-0 flex flex-col relative min-h-0 pb-44 md:pb-0">
          {/* Desktop Steps */}
          <div className="hidden md:block border-b-2 border-gray-300 dark:border-gray-700">
            <Steps
              steps={steps}
              currentStep={currentStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={setCurrentStep}
            />
          </div>

          {/* Mobile Navigation - Top bar with back/next */}
          <div className="md:hidden bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-3 py-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {steps[currentStep]}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    const nextStep = currentStep + 1;
                    if (nextStep <= maxUnlockedStep) {
                      setCurrentStep(nextStep);
                    }
                  }
                }}
                disabled={currentStep >= steps.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
            {renderStepContent()}
          </div>

          {/* Floating Input Bar - Only visible on step 3 */}
          {currentStep === 2 && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'make it brighter')..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>

        {/* Right Component - transparent floating bar on phone, sidebar on tablet+ */}
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-80 lg:w-96 bg-transparent md:bg-white md:dark:bg-[#1A1A1A] p-4 sm:p-6 m-0 md:overflow-y-auto flex flex-col md:border-t-0 border-gray-300 dark:border-gray-700 shrink-0 z-50 md:shadow-none">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
