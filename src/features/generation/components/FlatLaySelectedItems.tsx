import AspectRatio, { type AspectRatioValue } from '@/components/shared/aspectRatio';
import Resolution, { type ResolutionValue } from '@/components/shared/resolution';

interface FlatLaySelectedItemsProps {
  uploadedImagesCount: number;
  isFullBody: boolean;
  selectionType: ('top' | 'bottom')[];
  selectedModel: string | null;
  selectedBackground: number | string | null;
  aspectRatio: AspectRatioValue;
  onAspectRatioChange: (value: AspectRatioValue) => void;
  resolution: ResolutionValue;
  onResolutionChange: (value: ResolutionValue) => void;
}

export function FlatLaySelectedItems({
  uploadedImagesCount,
  isFullBody,
  selectionType,
  selectedModel,
  selectedBackground,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
}: FlatLaySelectedItemsProps) {
  return (
    <div className="border-t dark:border-gray-700 pt-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Selected Items</h3>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>Products: <span className="font-medium">{uploadedImagesCount} selected</span></p>
        <p>Type: <span className="font-medium capitalize">
          {isFullBody ? 'Full Body' : selectionType.join(' + ')}
        </span></p>
        <p>Models: <span className="font-medium">{selectedModel ? '1 selected' : 'Not selected'}</span></p>
        <p>Background: <span className="font-medium">{selectedBackground ? 'Selected' : 'Not selected'}</span></p>
      </div>
      
      {/* Aspect Ratio Selector */}
      <div className="pt-2">
        <AspectRatio
          value={aspectRatio}
          onValueChange={onAspectRatioChange}
        />
      </div>
      
      {/* Resolution Selector */}
      <div className="pt-2">
        <Resolution
          value={resolution}
          onValueChange={onResolutionChange}
        />
      </div>
    </div>
  );
}
