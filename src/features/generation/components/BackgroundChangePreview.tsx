import { RotateCw } from 'lucide-react';
import { ImageFeedbackActions } from './ImageFeedbackActions';
import type { Background } from '@/types/background';

interface BackgroundChangePreviewProps {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generationHistory: string[];
  onReset: () => void;
  onUndo: () => void;
  onStartOver: () => void;
  aspectRatio: string;
  onImageDoubleClick?: () => void;
  photos?: { [key: number]: string };
  selectedBackground?: Background | null;
}

export function BackgroundChangePreview({
  isGenerating,
  generationError,
  generatedImageUrl,
  generationHistory,
  onReset,
  onUndo,
  onStartOver,
  aspectRatio,
  onImageDoubleClick,
  photos = {},
  selectedBackground,
}: BackgroundChangePreviewProps) {
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
                onClick={onReset}
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
              onClick={onStartOver}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium transition-colors text-xs sm:text-sm"
            >
              Start Over
            </button>
            
            <div 
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all shadow-xl animate-in fade-in duration-500 mx-auto cursor-pointer w-full max-w-[92%] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[480px] mb-20" 
              style={{ aspectRatio }}
              onDoubleClick={onImageDoubleClick}
            >
              <img
                src={generatedImageUrl}
                alt="Generated background change"
                className="w-full h-full object-cover"
              />
              
              {/* Image Feedback Actions */}
              <ImageFeedbackActions
                onUndo={onUndo}
                onThumbsUp={() => console.log('Thumbs up')}
                onThumbsDown={() => console.log('Thumbs down')}
                showUndo={generationHistory.length > 0}
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile preview - image grid like FlatLay */}
            <div className="w-full px-4 md:hidden">
              {(() => {
                const productPhotos = Object.entries(photos).map(([key, url]) => ({ key: `photo-${key}`, url }));
                const backgroundImage = selectedBackground?.url || null;

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {productPhotos.map(({ key, url }) => (
                      <div key={key} className="aspect-[3/4] rounded-xl overflow-hidden">
                        <img src={url} alt="Product" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {backgroundImage && (
                      <div className="aspect-[3/4] rounded-xl overflow-hidden">
                        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Desktop fallback text */}
            <div className="hidden md:block text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Review your selections and generate your photo with new background</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
