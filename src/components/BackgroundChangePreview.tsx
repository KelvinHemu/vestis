import { RotateCw } from 'lucide-react';
import { ImageFeedbackActions } from './ImageFeedbackActions';

interface BackgroundChangePreviewProps {
  isGenerating: boolean;
  generationError: string | null;
  generatedImageUrl: string | null;
  generationHistory: string[];
  onReset: () => void;
  onUndo: () => void;
  aspectRatio: string;
  onImageDoubleClick?: () => void;
}

export function BackgroundChangePreview({
  isGenerating,
  generationError,
  generatedImageUrl,
  generationHistory,
  onReset,
  onUndo,
  aspectRatio,
  onImageDoubleClick,
}: BackgroundChangePreviewProps) {
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
            <div 
              className="relative rounded-3xl overflow-hidden ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-400 transition-all shadow-xl animate-in fade-in duration-500 cursor-pointer w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]" 
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
          <div className="text-center">
            <p className="text-gray-600 mb-4">Review your selections and generate your photo with new background</p>
          </div>
        )}
      </div>
    </div>
  );
}
