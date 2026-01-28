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
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-3 sm:p-4 bg-white dark:bg-gray-800">
      <div className="flex gap-2 sm:gap-3 items-start">
        {/* Image Preview */}
        <div className="w-32 h-44 sm:w-40 sm:h-56 lg:w-56 lg:h-72 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200">
          {frontImage ? (
            <img 
              src={frontImage} 
              alt={title}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-28 h-36 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">{title}</h3>
          
          <div className="space-y-1 sm:space-y-1.5">
            {/* Front Image Status */}
            <button
              onClick={onUploadFront}
              className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
            >
              {frontImage ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium truncate">Front image</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 truncate">Upload front image</span>
                </>
              )}
            </button>

            {/* Back Image Status */}
            <button
              onClick={onUploadBack}
              className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
            >
              {backImage ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium truncate">Back image</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 truncate">Upload back image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
