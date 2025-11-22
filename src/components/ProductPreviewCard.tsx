import { Check, Plus } from 'lucide-react';

interface ProductPreviewCardProps {
  title: string;
  frontImage?: string;
  backImage?: string;
  onUploadFront?: () => void;
  onUploadBack?: () => void;
}

export function ProductPreviewCard({
  title,
  frontImage,
  backImage,
  onUploadFront,
  onUploadBack
}: ProductPreviewCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white">
      <div className="flex gap-3 items-start">
        {/* Image Preview */}
        <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {frontImage ? (
            <img 
              src={frontImage} 
              alt={title}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-18 h-18 bg-gray-200 rounded-lg"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
          
          <div className="space-y-1.5">
            {/* Front Image Status */}
            <button
              onClick={onUploadFront}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {frontImage ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-gray-900 font-medium">Front image</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400">Upload front image</span>
                </>
              )}
            </button>

            {/* Back Image Status */}
            <button
              onClick={onUploadBack}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {backImage ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-gray-900 font-medium">Back image</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400">Upload back image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
