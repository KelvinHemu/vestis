import { ProductPreviewCard } from './ProductPreviewCard';

interface FlatLayPreviewPanelProps {
  selectionType: ('top' | 'bottom')[];
  topImages: { [key: number]: string };
  bottomImages: { [key: number]: string };
}

export function FlatLayPreviewPanel({
  selectionType,
  topImages,
  bottomImages,
}: FlatLayPreviewPanelProps) {
  const isFullBody = selectionType.length === 2 && 
                     selectionType.includes('top') && 
                     selectionType.includes('bottom');

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
        Preview
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {selectionType.length > 0 ? (
          <>
            {/* Show Full Body card when both are selected */}
            {isFullBody ? (
              <ProductPreviewCard
                title="Full Body Photos"
                frontImage={topImages[1] || bottomImages[1]}
                backImage={topImages[2] || bottomImages[2]}
              />
            ) : (
              <>
                {/* Top Photos Card */}
                <ProductPreviewCard
                  title="Top Photos"
                  frontImage={topImages[1]}
                  backImage={topImages[2]}
                />

                {/* Bottom Photos Card */}
                <ProductPreviewCard
                  title="Bottom Photos"
                  frontImage={bottomImages[1]}
                  backImage={bottomImages[2]}
                />
              </>
            )}
          </>
        ) : (
          /* Show placeholder if no selection */
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-center px-4">
              Select product type to see preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
