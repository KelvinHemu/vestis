import { ProductPreviewCard } from './ProductPreviewCard';
import { ModelPreviewCard } from '@/features/models/components/ModelPreviewCard';
import { BackgroundPreviewCard } from './BackgroundPreviewCard';
import type { Model } from '@/types/model';
import type { Background } from '@/types/background';
import modelService from '@/services/modelService';

interface OnModelPreviewPanelProps {
  photos: string[];
  selectedModel: Model | null;
  selectedBackground: Background | null;
}

export function OnModelPreviewPanel({
  photos,
  selectedModel,
  selectedBackground,
}: OnModelPreviewPanelProps) {
  const hasPhotos = photos.length > 0;
  const hasModel = selectedModel !== null;
  const hasBackground = selectedBackground !== null;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Preview
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {hasPhotos || hasModel || hasBackground ? (
          <>
            {/* Product Photos Card */}
            {hasPhotos && (
              <ProductPreviewCard
                title="Product Photos"
                frontImage={photos[0]}
                backImage={photos[1]}
              />
            )}

            {/* Model Card */}
            {hasModel && (
              <ModelPreviewCard
                name={selectedModel.name}
                gender={selectedModel.gender}
                ageRange={modelService.formatAgeRange(selectedModel.age_range)}
                imageUrl={modelService.getMainImage(selectedModel) || ''}
              />
            )}

            {/* Background Card */}
            {hasBackground && (
              <BackgroundPreviewCard
                name={selectedBackground.name}
                category={selectedBackground.category}
                imageUrl={selectedBackground.url}
              />
            )}
          </>
        ) : (
          /* Show placeholder if no selection */
          <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-center px-4">
              Upload photos and select options to see preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
