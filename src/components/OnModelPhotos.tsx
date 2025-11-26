import { useState, useEffect } from 'react';
import { MainContent } from './MainContent';
import { Steps } from './Steps';
import { OnModelUpload } from './OnModelUpload';
import { ModelSelector } from './ModelSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { OnModelPreviewPanel } from './OnModelPreviewPanel';
import { FloatingPromptInput } from './FloatingPromptInput';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import { InsufficientCreditsDialog } from './ui/InsufficientCreditsDialog';
import { useOnModelGeneration } from '../hooks/useOnModelGeneration';
import { chatService } from '../services/chatService';
import type { ModelPhoto } from '../types/onModel';
import type { Model } from '../types/model';
import type { Background } from '../types/background';
import modelService from '../services/modelService';
import { getBackgroundById } from '../services/backgroundService';
import { RotateCw } from 'lucide-react';
import AspectRatio, { type AspectRatioValue } from './aspectRatio';
import Resolution, { type ResolutionValue } from './resolution';

export function OnModelPhotos() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [photos, setPhotos] = useState<{ [key: number]: string }>({});
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<number | string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('auto');
  const [resolution, setResolution] = useState<ResolutionValue>('2K');

  const {
    isGenerating,
    generationError,
    generatedImageUrl,
    generateOnModel,
    resetGeneration,
    setGeneratedImageUrl,
    insufficientCredits,
  } = useOnModelGeneration();

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
  const getAspectRatioValue = (ratio: AspectRatioValue): string => {
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
    if (isLocalGenerating || isGenerating) {
      console.log('⏳ Generation already in progress, ignoring duplicate request');
      return;
    }

    if (!selectedModelId || !selectedBackgroundId) {
      console.error('Missing required fields');
      return;
    }

    // Add current image to history before generating new one
    if (generatedImageUrl) {
      setGenerationHistory(prev => [...prev, generatedImageUrl]);
    }

    setIsLocalGenerating(true);

    try {
      // If we're in edit mode and have a prompt, use chat service for editing
      if (isEditMode && prompt.trim() && generatedImageUrl) {
        console.log('✏️ Editing image with chat service');
        const response = await chatService.editImage(
          generatedImageUrl,
          prompt.trim()
        );

        // Chat service returns completed images directly, no need to poll
        if (response.imageUrl) {
          setGeneratedImageUrl(response.imageUrl);
          setPrompt('');
        } else {
          throw new Error(response.message || 'Image editing failed');
        }
        setIsLocalGenerating(false);
        return;
      }

      // Convert photos object to array of ModelPhoto
      // Backend expects id and image fields, id must be string
      const modelPhotos: ModelPhoto[] = Object.entries(photos).map(([id, image]) => ({
        id: id.toString(), // Ensure ID is string
        image,
      }));

      // Backend expects backgroundId as string
      const request = {
        photos: modelPhotos,
        modelId: selectedModelId,
        backgroundId: String(selectedBackgroundId), // Ensure string type
        ...(prompt.trim() && { prompt: prompt.trim() }), // Include prompt if not empty
        aspectRatio,
        resolution,
      };

      console.log('🚀 Generating on-model photos with request:', {
        photosCount: modelPhotos.length,
        modelId: request.modelId,
        backgroundId: request.backgroundId,
        photoIds: modelPhotos.map(p => p.id),
        hasPrompt: !!prompt.trim(),
        aspectRatio,
        resolution,
      });
      
      await generateOnModel(request);
      
      // Enable edit mode and clear prompt after generation
      setIsEditMode(true);
      setPrompt('');
    } catch (error) {
      console.error('Error in handleGenerateImage:', error);
      // Error handling is done in the hook or chat service
    } finally {
      setIsLocalGenerating(false);
    }
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Upload Photos
        return Object.keys(photos).length > 0;
      case 1: // Select Models
        return selectedModelId !== null;
      case 2: // Select Background
        return selectedBackgroundId !== null;
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
    switch (currentStep) {
      case 0:
        return (
          <OnModelUpload
            photos={photos}
            onFileUpload={handleFileUpload}
            onClear={() => setPhotos({})}
          />
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
        const isLoading = isGenerating || isLocalGenerating;
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-6">
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Failed</h3>
                    <p className="text-sm text-gray-600 mb-4">{generationError}</p>
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
                <div className="relative rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 mx-auto" style={{ width: '380px', aspectRatio: getAspectRatioValue(aspectRatio) }}>
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
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Review your selections and generate your on-model photos</p>
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
        {/* Preview section at the top */}
        <OnModelPreviewPanel
          photos={Object.values(photos)}
          selectedModel={selectedModel}
          selectedBackground={selectedBackground}
        />

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>
        
        {/* Selected Items and Button at the bottom */}
        <div className="space-y-6">
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
                  link.download = 'on-model-photo.png';
                  link.click();
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
          {!(currentStep === 3 && generatedImageUrl) && (
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
      
      {/* Content Area with Left and Right Sections */}
      <div className="flex gap-0 h-full border-2 border-gray-300">
        {/* Left Component - 3/4 width */}
        <div className="flex-1 bg-white border-r-2 border-gray-300 m-0 overflow-y-auto relative">
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
          
          {/* Floating Input Bar - Only visible on step 3 (Preview & Generate) and not while generating */}
          {currentStep === 3 && !isGenerating && !isLocalGenerating && (
            <FloatingPromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerateImage}
              placeholder={isEditMode ? "Describe changes you'd like to make..." : "Add more details about your image (optional)..."}
            />
          )}
        </div>
        
        {/* Right Component - 1/4 width */}
        <div className="w-full md:w-1/4 bg-white p-6 m-0 overflow-y-auto flex flex-col">
          {renderRightPanel()}
        </div>
      </div>
    </MainContent>
  );
}
