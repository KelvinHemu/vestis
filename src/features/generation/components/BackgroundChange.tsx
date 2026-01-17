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
import { RotateCw } from 'lucide-react';
import AspectRatio from '@/components/shared/aspectRatio';
import Resolution from '@/components/shared/resolution';

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
    aspectRatio,
    resolution,
    generatedImageUrl: storedGeneratedImageUrl,
    setCurrentStep,
    setMaxUnlockedStep,
    setPhotos,
    setSelectedBackgroundId,
    setAdditionalInfo,
    setIsEditMode,
    setGenerationHistory,
    setAspectRatio,
    setResolution,
    setGeneratedImageUrl: setStoredGeneratedImageUrl,
    resetBackgroundChange,
  } = useBackgroundChangeStore();

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
            aspectRatio={getAspectRatioValue(aspectRatio)}
            onImageDoubleClick={() => setIsFullscreenOpen(true)}
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
        <div className="flex-1 bg-white dark:bg-gray-900 md:border-r-2 border-gray-300 dark:border-gray-700 m-0 overflow-y-auto relative min-h-0 pb-44 md:pb-0">
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

        {/* Right Component - fixed bottom bar on phone, sidebar on tablet+ */}
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-80 lg:w-96 bg-white dark:bg-gray-900 p-4 sm:p-6 m-0 md:overflow-y-auto flex flex-col border-t-2 md:border-t-0 border-gray-300 dark:border-gray-700 shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
