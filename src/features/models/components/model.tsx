import { Card } from '@/components/ui/card';
import { Heart, Eye, Check } from 'lucide-react';

// ============================================================================
// ModelCardInfo Component - Displays model metadata (name, age, size)
// Clean text-based design for displaying model information below the image
// ============================================================================

interface ModelCardInfoProps {
  name: string;
  age: string;
  size: string;
}

function ModelCardInfo({ name, age, size }: ModelCardInfoProps) {
  return (
    <div className="px-2 sm:px-3 py-1">
      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        {/* Name - Left */}
        <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate max-w-[45%] sm:max-w-none">
          {name}
        </div>

        {/* Age and Size - Right */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 whitespace-nowrap">
            {age}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 whitespace-nowrap">
            {size}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ModelCard Component - Main card displaying model with image and info
// Features hover overlay with Favorite and Preview actions
// ============================================================================

interface ModelCardProps {
  id: string;
  name: string;
  age: string;
  size: string;
  image: string;
  isSelected?: boolean;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavorite?: () => void;
  onPreview?: () => void;
}

export function ModelCard({
  name,
  age,
  size,
  image,
  isSelected = false,
  isFavorite = false,
  onClick,
  onFavorite,
  onPreview
}: ModelCardProps) {
  // Handle favorite click - prevent card selection
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.();
  };

  // Handle preview click - prevent card selection
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.();
  };

  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden transition-all bg-white dark:bg-gray-800 group ${isSelected
        ? 'ring-2 ring-black dark:ring-white shadow-lg'
        : 'hover:shadow-md'
        }`}
    >
      {/* Model Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Selected Checkmark - Top Right */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-20">
            <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Hover Overlay - Hidden when selected */}
        {!isSelected && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {/* Favorite & Preview Actions - Bottom Center */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center justify-center gap-6">
                {/* Favorite Button */}
                <button
                  onClick={handleFavoriteClick}
                  className="flex flex-col items-center gap-1 text-white"
                  title="Add to favorites"
                >
                  <span className="text-xs font-medium">Favorite</span>
                  <Heart
                    className={`w-5 h-5 hover:scale-125 transition-transform ${isFavorite ? 'fill-red-500 text-red-500' : 'hover:text-white'}`}
                  />
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-white/40" />

                {/* Preview Button */}
                <button
                  onClick={handlePreviewClick}
                  className="flex flex-col items-center gap-1 text-white"
                  title="Preview model"
                >
                  <span className="text-xs font-medium">Preview</span>
                  <Eye className="w-5 h-5 hover:scale-125 hover:text-white transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section - Below Image */}
      <ModelCardInfo name={name} age={age} size={size} />
    </Card>
  );
}

// ============================================================================
// Export ModelCardInfo for direct use if needed
// ============================================================================
export { ModelCardInfo };
