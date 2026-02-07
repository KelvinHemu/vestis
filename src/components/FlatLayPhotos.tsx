"use client";

import { useState, useEffect, useRef } from 'react';
import { MainContent } from './layout/MainContent';
import { Steps } from '../features/generation/components/Steps';
import { ProductSelector } from '../features/generation/components/ProductSelector';
import { ModelSelector } from '../features/models/components/ModelSelector';
import { BackgroundSelector } from '../features/generation/components/BackgroundSelector';
import { FlatLayPreviewPanel } from '../features/generation/components/FlatLayPreviewPanel';
import { FlatLayActionButton } from '../features/generation/components/FlatLayActionButton';
import { FloatingPromptInput } from '../features/generation/components/FloatingPromptInput';
import { ImageFeedbackActions } from '../features/generation/components/ImageFeedbackActions';
import { InsufficientCreditsDialog } from './ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from './ui/FullscreenImageViewer';
import { flatLayService } from '../services/flatLayService';
import { chatService } from '../services/chatService';
import { InsufficientCreditsError } from '../types/errors';
import { useInvalidateGenerations } from '../hooks/useGenerations';
import { useInvalidateFlatLay } from '../hooks/useFlatLay';
import { useFlatLayStore } from '../contexts/featureStores';
import { useFeatureGeneration } from '../contexts/generationStore';
import type { ProductImage } from '../types/flatlay';
import { RotateCw, Settings, X } from 'lucide-react';
import AspectRatio from './shared/aspectRatio';
import Resolution from './shared/resolution';

// Helper function to convert aspect ratio string to CSS aspect-ratio value
const getAspectRatioValue = (ratio: string): string => {
  if (ratio === 'auto') return '3/4'; // Default to 3:4
  // Convert ratio like '16:9' to '16/9' for CSS
  return ratio.replace(':', '/');
};

export function FlatLayPhotos() {
  // Get persisted state from store
  const {
    currentStep,
    maxUnlockedStep,
    selectionType,
    topImages,
    bottomImages,
    selectedModel,
    selectedBackground,
    generatedImageUrl,
    additionalInfo,
    isEditMode,
    generationHistory,
    aspectRatio,
    resolution,
    setCurrentStep,
    setMaxUnlockedStep,
    setSelectionType,
    setTopImages,
    setBottomImages,
    setSelectedModel,
    setSelectedBackground,
    setGeneratedImageUrl,
    setAdditionalInfo,
    setIsEditMode,
    setGenerationHistory,
    setAspectRatio,
    setResolution,
    resetFlatLay,
  } = useFlatLayStore();
  
  // Generation state from global store (persists across navigation)
  const {
    isGenerating,
    error: generationStoreError,
    generatedImageUrl: newGeneratedImageUrl,
    startGeneration,
    completeGeneration,
    failGeneration,
    resetGeneration,
  } = useFeatureGeneration('flatlay');

  // Handle Start Over - reset all state
  const handleStartOver = () => {
    resetFlatLay();
    resetGeneration();
    setGenerationError(null);
  };
  
  // Local (non-persisted) state for transient UI states
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ available: number; required: number } | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // iOS Safari (especially iPhone 15 Pro Max) can fail to render cross-origin images.
  // Only converts to blob URL on error — zero overhead on normal browsers.
  const [fallbackBlobUrl, setFallbackBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Reset fallback blob URL when generated image changes
  useEffect(() => {
    setFallbackBlobUrl(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, [generatedImageUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // Called only when <img> fails to load — fetches as blob for iOS Safari
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // If we already tried the blob fallback, give up
    if (fallbackBlobUrl || !generatedImageUrl) return;
    // Don't retry data/blob URLs
    if (generatedImageUrl.startsWith('data:') || generatedImageUrl.startsWith('blob:')) return;

    fetch(generatedImageUrl, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setFallbackBlobUrl(url);
      })
      .catch(() => {
        // Nothing more we can do
        console.warn('iOS image fallback also failed for:', generatedImageUrl);
      });
  };

  // Sync generation store error with local error state
  useEffect(() => {
    if (generationStoreError) {
      setGenerationError(generationStoreError);
    }
  }, [generationStoreError]);

  // When generation completes in background, update the persisted state
  useEffect(() => {
    if (newGeneratedImageUrl && newGeneratedImageUrl !== generatedImageUrl) {
      setGeneratedImageUrl(newGeneratedImageUrl);
      setIsEditMode(true);
      setAdditionalInfo('');
      // Invalidate caches to show new generation in history
      invalidateGenerations();
      invalidateFlatLay();
    }
  }, [newGeneratedImageUrl]);

  // Cache invalidation hooks
  const invalidateGenerations = useInvalidateGenerations();
  const invalidateFlatLay = useInvalidateFlatLay();

  const handleFileUpload = (index: number, file: File | null) => {
    console.log('handleFileUpload called with index:', index, 'file:', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('FileReader result:', result.substring(0, 50) + '...');
        
        // Store in the appropriate state based on current selection
        if (selectionType.includes('top') && !selectionType.includes('bottom')) {
          setTopImages(prev => ({
            ...prev,
            [index]: result
          }));
        } else if (selectionType.includes('bottom') && !selectionType.includes('top')) {
          setBottomImages(prev => ({
            ...prev,
            [index]: result
          }));
        } else {
          // Full body - store in both
          setTopImages(prev => ({
            ...prev,
            [index]: result
          }));
          setBottomImages(prev => ({
            ...prev,
            [index]: result
          }));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      // Remove image if file is null
      if (selectionType.includes('top') && !selectionType.includes('bottom')) {
        setTopImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      } else if (selectionType.includes('bottom') && !selectionType.includes('top')) {
        setBottomImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      } else {
        setTopImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
        setBottomImages(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }
    }
  };

  const steps = [
    'Select Products',
    'Select Models',
    // 'Customize Models',
    // 'Select Poses',
    'Select Background',
    'Preview & Generate'
  ];

  // Handle undo edit
  const handleUndoEdit = () => {
    if (generationHistory.length > 0) {
      const previousImage = generationHistory[generationHistory.length - 1];
      setGeneratedImageUrl(previousImage);
      setGenerationHistory(prev => prev.slice(0, -1));
    }
  };

  // Generate flatlay image
  const handleGenerateImage = async () => {
    if (!selectedModel || !selectedBackground) {
      setGenerationError('Please select a model and background');
      return;
    }

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    // Start generation in global store (persists across navigation)
    startGeneration();
    setGenerationError(null);

    try {
      // If we're in edit mode and have a prompt, use chat service for editing
      if (isEditMode && additionalInfo.trim() && generatedImageUrl) {
        console.log('✏️ Editing image with chat service');
        const response = await chatService.editImage(
          generatedImageUrl,
          additionalInfo.trim()
        );

        // Chat service returns completed images directly, no need to poll
        if (response.imageUrl) {
          completeGeneration(response.imageUrl);
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        return;
      }

      // Build products array
      const products: ProductImage[] = [];

      // Add top images if they exist
      if (Object.keys(topImages).length > 0) {
        const topProduct: ProductImage = {
          type: 'top',
        };
        
        // Only add images if they actually exist
        if (topImages[1]) {
          topProduct.frontImage = topImages[1];
        }
        if (topImages[2]) {
          topProduct.backImage = topImages[2];
        }
        
        // Only add product if at least one image exists
        if (topProduct.frontImage || topProduct.backImage) {
          products.push(topProduct);
        }
      }

      // Add bottom images if they exist
      if (Object.keys(bottomImages).length > 0) {
        const bottomProduct: ProductImage = {
          type: 'bottom',
        };
        
        // Only add images if they actually exist
        if (bottomImages[1]) {
          bottomProduct.frontImage = bottomImages[1];
        }
        if (bottomImages[2]) {
          bottomProduct.backImage = bottomImages[2];
        }
        
        // Only add product if at least one image exists
        if (bottomProduct.frontImage || bottomProduct.backImage) {
          products.push(bottomProduct);
        }
      }

      // Validate we have at least one product with at least one image
      if (products.length === 0) {
        failGeneration('Please upload at least one product image');
        return;
      }

      console.log('📦 Sending generation request with products:', products.length);
      console.log('📦 Model ID:', selectedModel, 'Type:', typeof selectedModel);
      console.log('📦 Background ID:', selectedBackground, 'Type:', typeof selectedBackground);
      console.log('📦 Aspect Ratio:', aspectRatio);
      console.log('📦 Resolution:', resolution);

      // Call generation service
      const response = await flatLayService.generateFlatlay({
        products,
        modelId: selectedModel,
        backgroundId: selectedBackground,
        aspectRatio: aspectRatio,
        resolution: resolution,
        options: {
          quality: 'high',
          format: 'png',
        },
      });

      if (response.success) {
        // If we have a job ID, poll for status
        if (response.jobId) {
          
          const finalStatus = await flatLayService.pollJobStatus(
            response.jobId,
            () => {
              // Status update callback - can be used for logging if needed
            }
          );

          if (finalStatus.status === 'completed' && finalStatus.imageUrl) {
            completeGeneration(finalStatus.imageUrl);
          } else {
            throw new Error(finalStatus.error || 'Image generation failed');
          }
        } else if (response.imageUrl) {
          // Immediate response with image URL
          completeGeneration(response.imageUrl);
        }
      } else {
        throw new Error(response.message || 'Image generation failed');
      }
    } catch (error) {
      console.error('Error generating flatlay:', error);
      
      // Handle insufficient credits error specifically
      if (error instanceof InsufficientCreditsError) {
        setInsufficientCredits({
          available: error.creditsAvailable,
          required: error.creditsRequired,
        });
        failGeneration('');  // Clear generating state but don't show error (dialog will show)
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
        failGeneration(errorMessage);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Get current images based on selection
        const currentImages = selectionType.includes('top') && !selectionType.includes('bottom') 
          ? topImages 
          : selectionType.includes('bottom') && !selectionType.includes('top')
          ? bottomImages
          : { ...topImages, ...bottomImages };
        
        console.log('Rendering step 0, current images:', currentImages);
        return (
          <ProductSelector
            selectionType={selectionType}
            onSelectionTypeChange={setSelectionType}
            imageUrls={currentImages}
            onFileUpload={handleFileUpload}
            onClear={() => {
              setTopImages({});
              setBottomImages({});
            }}
          />
        );
      case 1:
        return (
          <div className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel || undefined}
              onModelSelect={(modelId) => setSelectedModel(modelId)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <BackgroundSelector
              selectedBackground={selectedBackground || undefined}
              onBackgroundSelect={(backgroundId) => setSelectedBackground(backgroundId)}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 sm:gap-4 md:gap-6">
              {isGenerating ? (
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Failed</h3>
                    <p className="text-sm text-gray-600 mb-4">{generationError}</p>
                    <button
                      onClick={() => {
                        setGenerationError(null);
                        handleGenerateImage();
                      }}
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
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors text-xs sm:text-sm"
                  >
                    Start Over
                  </button>
                  
                  <div 
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 cursor-pointer w-full sm:max-w-[300px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[440px] mb-20 mx-auto" 
                    style={{ aspectRatio: getAspectRatioValue(aspectRatio) }}
                    onDoubleClick={() => setIsFullscreenOpen(true)}
                  >
                    <img
                      src={fallbackBlobUrl || generatedImageUrl}
                      alt="Generated Flatlay"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
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
                  <p className="text-gray-600 mb-4">Review your selections and generate your flatlay photos</p>
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
    const topImagesCount = Object.keys(topImages).length;
    const bottomImagesCount = Object.keys(bottomImages).length;
    const uploadedImagesCount = topImagesCount + bottomImagesCount;
    const isFullBody = selectionType.length === 2 && 
                       selectionType.includes('top') && 
                       selectionType.includes('bottom');
    
    // Validation logic
    const hasUploadedAnyProduct = uploadedImagesCount >= 1; // At least one image (front OR back)
    const hasSelectedModel = selectedModel !== null;
    const hasSelectedBackground = selectedBackground !== null;
    
    // Determine if user can proceed to next step
    const canProceedToNextStep = () => {
      switch (currentStep) {
        case 0: // Product selection
          // If Full Body: can proceed if at least one image uploaded
          // If Top or Bottom only: go to opposite selection on next click
          return hasUploadedAnyProduct;
        case 1: // Model selection
          return hasSelectedModel;
        case 2: // Background selection
          return hasSelectedBackground;
        case 3: // Preview & Generate step
          // Can generate if not already generating and all items selected
          return !isGenerating && hasUploadedAnyProduct && hasSelectedModel && hasSelectedBackground && !generatedImageUrl;
        default:
          return true;
      }
    };

    // Handle next step logic
    const handleNextStep = async () => {
      if (currentStep === 0) {
        const hasTopImages = Object.keys(topImages).length > 0;
        const hasBottomImages = Object.keys(bottomImages).length > 0;
        
        // If both top and bottom images exist, proceed to next step
        if (hasTopImages && hasBottomImages) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          if (nextStep > maxUnlockedStep) {
            setMaxUnlockedStep(nextStep);
          }
          return;
        }
        
        // If user selected only Top and hasn't uploaded bottom yet, switch to Bottom
        if (selectionType.length === 1 && selectionType.includes('top') && !hasBottomImages) {
          setSelectionType(['bottom']);
          return;
        }
        // If user selected only Bottom and hasn't uploaded top yet, switch to Top
        if (selectionType.length === 1 && selectionType.includes('bottom') && !hasTopImages) {
          setSelectionType(['top']);
          return;
        }
        // If Full Body, proceed to next step
        if (isFullBody) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          if (nextStep > maxUnlockedStep) {
            setMaxUnlockedStep(nextStep);
          }
        }
      } else if (currentStep === 3) {
        // Step 3 (Preview & Generate) - Generate Image action
        await handleGenerateImage();
      } else {
        // For other steps, just move forward
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (nextStep > maxUnlockedStep) {
          setMaxUnlockedStep(nextStep);
        }
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Preview section - hidden on phone only */}
        <div className="hidden md:block">
          <FlatLayPreviewPanel
            selectionType={selectionType}
            topImages={topImages}
            bottomImages={bottomImages}
          />
        </div>
        
        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>
        
        {/* Selected Items and Button at the bottom */}
        <div className="space-y-4 md:space-y-6">
          {/* Aspect Ratio & Resolution - desktop only */}
          <div className="hidden md:block">
            <AspectRatio
              value={aspectRatio}
              onValueChange={setAspectRatio}
            />
          </div>
          <div className="hidden md:block">
            <Resolution
              value={resolution}
              onValueChange={setResolution}
            />
          </div>

          {/* Settings button - mobile only */}
          <div className="md:hidden flex items-center justify-between">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
              <span className="text-xs text-gray-500">({aspectRatio} · {resolution})</span>
            </button>
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

                    // Always try the standard download first
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'flatlay-image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // iOS Safari silently ignores link.click() with download attribute.
                    // After a short delay, fall back to opening in a new tab.
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

                    if (isIOS) {
                      setTimeout(() => {
                        window.open(url, '_blank');
                        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                      }, 1500);
                    } else {
                      setTimeout(() => window.URL.revokeObjectURL(url), 3000);
                    }
                  } catch (err) {
                    console.error('Failed to download image:', err);
                    window.open(generatedImageUrl, '_blank');
                  }
                }}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Download
              </button>
              <button
                onClick={async () => {
                  setGeneratedImageUrl(null);
                  setGenerationError(null);
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
          {!(currentStep === 3 && generatedImageUrl) && (
            <FlatLayActionButton
              generationError={generationError}
              isGenerating={isGenerating}
              canProceed={canProceedToNextStep()}
              currentStep={currentStep}
              totalSteps={steps.length}
              onNextStep={handleNextStep}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <MainContent
      showBackButton={false}
    >
      {/* Mobile Settings Sheet */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 pb-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quality Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5">
              <AspectRatio
                value={aspectRatio}
                onValueChange={setAspectRatio}
              />
              <Resolution
                value={resolution}
                onValueChange={setResolution}
              />
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={!!insufficientCredits}
        onClose={() => setInsufficientCredits(null)}
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

              // Always try the standard download first
              const link = document.createElement('a');
              link.href = url;
              link.download = 'flatlay-image.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // iOS Safari silently ignores link.click() with download attribute.
              // After a short delay, fall back to opening in a new tab.
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

              if (isIOS) {
                setTimeout(() => {
                  window.open(url, '_blank');
                  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                }, 1500);
              } else {
                setTimeout(() => window.URL.revokeObjectURL(url), 3000);
              }
            } catch (err) {
              console.error('Failed to download image:', err);
              window.open(generatedImageUrl, '_blank');
            }
          }}
        />
      )}
      
      {/* Content Area with Left and Right Sections */}
      <div className="flex flex-col md:flex-row gap-0 h-full border-2 border-gray-300 overflow-hidden">
        {/* Left Component - full width on phone, flex-1 on tablet+ */}
        <div className="flex-1 bg-white md:border-r-2 border-gray-300 m-0 overflow-y-auto relative min-h-0 pb-44 md:pb-0">
          <div className="hidden md:block border-b-2 border-gray-300">
            <Steps 
              steps={steps} 
              currentStep={currentStep}
              maxUnlockedStep={maxUnlockedStep}
              onStepChange={setCurrentStep}
            />
          </div>
          <div className={currentStep === 3 ? "p-2 sm:p-4 md:p-8" : "p-8"}>
            {renderStepContent()}
          </div>
          
          {/* Floating Input Bar - Only visible on step 3 (Preview & Generate) */}
          {currentStep === 3 && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'adjust colors')..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>
        
        {/* Right Component - fixed bottom bar on phone, sidebar on tablet+ */}
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-80 lg:w-96 bg-white p-4 sm:p-6 m-0 md:overflow-y-auto flex flex-col border-t-2 md:border-t-0 border-gray-300 shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
