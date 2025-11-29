import { useState } from 'react';
import { MainContent } from './MainContent';
import { Steps } from './Steps';
import { MannequinSelector } from './MannequinSelector';
import { ModelSelector } from './ModelSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { FlatLayPreviewPanel } from './FlatLayPreviewPanel';
import { FlatLayActionButton } from './FlatLayActionButton';
import { RotateCw } from 'lucide-react';
import { FloatingPromptInput } from './FloatingPromptInput';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import { InsufficientCreditsDialog } from './ui/InsufficientCreditsDialog';
import { FullscreenImageViewer } from './ui/FullscreenImageViewer';
import { mannequinService } from '../services/mannequinService';
import { chatService } from '../services/chatService';
import { InsufficientCreditsError } from '../types/errors';
import { useInvalidateGenerations } from '../hooks/useGenerations';
import { useInvalidateMannequin } from '../hooks/useMannequin';
import { useMannequinStore } from '../contexts/featureStores';
import type { GenerateFlatLayRequest } from '../types/flatlay';
import AspectRatio from './aspectRatio';
import Resolution from './resolution';

// Helper function to convert aspect ratio string to CSS aspect-ratio value
const getAspectRatioValue = (ratio: string): string => {
  if (ratio === 'auto') return '3/4'; // Default to 3:4
  // Convert ratio like '16:9' to '16/9' for CSS
  return ratio.replace(':', '/');
};

export function MannequinPhotos() {
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
  } = useMannequinStore();
  
  // Local (non-persisted) state for transient UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ available: number; required: number } | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Cache invalidation hooks
  const invalidateGenerations = useInvalidateGenerations();
  const invalidateMannequin = useInvalidateMannequin();

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
    'Select Mannequin',
    'Select Models',
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

  // Generate mannequin image
  const handleGenerateImage = async () => {
    if (!selectedModel || !selectedBackground) {
      setGenerationError('Please select a model and background');
      return;
    }

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    setIsGenerating(true);
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
          setGeneratedImageUrl(response.imageUrl);
          setAdditionalInfo('');
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        setIsGenerating(false);
        return;
      }

      // Prepare products array from uploaded images
      const products: GenerateFlatLayRequest['products'] = [];
      
      // Check if we have top images
      const topImageEntries = Object.entries(topImages);
      const bottomImageEntries = Object.entries(bottomImages);
      
      // If full body (both top and bottom selected), create one product per pair
      if (selectionType.includes('top') && selectionType.includes('bottom')) {
        // For full body, we expect the same keys in both top and bottom
        const allKeys = new Set([...Object.keys(topImages), ...Object.keys(bottomImages)]);
        
        allKeys.forEach(key => {
          const numKey = Number(key);
          if (topImages[numKey] || bottomImages[numKey]) {
            products.push({
              type: 'fullbody' as const,
              frontImage: topImages[numKey] || bottomImages[numKey],
              backImage: bottomImages[numKey] || topImages[numKey],
            });
          }
        });
      } else if (selectionType.includes('top')) {
        // Only top images
        topImageEntries.forEach(([_, image]) => {
          products.push({
            type: 'top' as const,
            frontImage: image,
          });
        });
      } else if (selectionType.includes('bottom')) {
        // Only bottom images
        bottomImageEntries.forEach(([_, image]) => {
          products.push({
            type: 'bottom' as const,
            frontImage: image,
          });
        });
      }

      // Prepare the request payload
      const request: GenerateFlatLayRequest = {
        products,
        modelId: selectedModel,
        backgroundId: selectedBackground,
        aspectRatio: aspectRatio,
        resolution: resolution,
        options: {
          quality: 'high',
          format: 'png',
        },
      };

      console.log('🚀 Sending mannequin generation request:', {
        productsCount: products.length,
        modelId: selectedModel,
        backgroundId: selectedBackground,
        aspectRatio: aspectRatio,
        resolution: resolution,
      });

      // Call the mannequin service
      const response = await mannequinService.generateMannequin(request);
      
      console.log('✅ Mannequin generation response:', response);

      // Use the returned image URL directly
      if (response.imageUrl) {
        setGeneratedImageUrl(response.imageUrl);
        setIsEditMode(true);
        setAdditionalInfo('');
        // Invalidate caches to show new generation in history
        invalidateGenerations();
        invalidateMannequin();
      } else {
        throw new Error(response.message || 'No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error generating mannequin:', error);
      
      // Handle insufficient credits error specifically
      if (error instanceof InsufficientCreditsError) {
        setInsufficientCredits({
          available: error.creditsAvailable,
          required: error.creditsRequired,
        });
        setGenerationError(null);
      } else {
        setGenerationError(
          error instanceof Error ? error.message : 'Failed to generate image'
        );
      }
    } finally {
      setIsGenerating(false);
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
          <MannequinSelector
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
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-6">
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
                  <div 
                    className="relative rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] mx-auto cursor-pointer" 
                    style={{ 
                      aspectRatio: getAspectRatioValue(aspectRatio)
                    }}
                    onDoubleClick={() => setIsFullscreenOpen(true)}
                  >
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated Mannequin" 
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
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-semibold text-gray-900">Ready to Create</h2>
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
    const hasUploadedAnyProduct = uploadedImagesCount >= 1;
    const hasSelectedModel = selectedModel !== null;
    const hasSelectedBackground = selectedBackground !== null;
    
    // Determine if user can proceed to next step
    const canProceedToNextStep = () => {
      switch (currentStep) {
        case 0: // Product selection
          return hasUploadedAnyProduct;
        case 1: // Model selection
          return hasSelectedModel;
        case 2: // Background selection
          return hasSelectedBackground;
        case 3: // Preview & Generate step
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

          {/* Show Download button after image is generated */}
          {currentStep === 3 && generatedImageUrl && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImageUrl;
                  link.download = 'mannequin-image.png';
                  link.click();
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
          onDownload={() => {
            const link = document.createElement('a');
            link.href = generatedImageUrl;
            link.download = 'mannequin-photo.png';
            link.click();
          }}
        />
      )}
      
      {/* Content Area with Left and Right Sections */}
      <div className="flex flex-col md:flex-row gap-0 h-full border-2 border-gray-300 overflow-hidden">
        {/* Left Component - full width on phone, flex-1 on tablet+ */}
        <div className="flex-1 bg-white md:border-r-2 border-gray-300 m-0 overflow-y-auto relative min-h-0 pb-44 md:pb-0">
          <div className="border-b-2 border-gray-300">
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
          
          {/* Floating Input Bar - Only visible on step 4 (Preview & Generate) */}
          {currentStep === 3 && (
            <FloatingPromptInput
              value={additionalInfo}
              onChange={setAdditionalInfo}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes to make (e.g., 'adjust lighting')..." : "Add more details about your image (optional)..."}
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
