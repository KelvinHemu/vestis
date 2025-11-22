import type { Background } from '../types/background';

interface BackgroundChangePreviewPanelProps {
  photos: string[];
  selectedBackground: Background | null;
}

export function BackgroundChangePreviewPanel({
  photos,
  selectedBackground,
}: BackgroundChangePreviewPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Photos</h3>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden bg-gray-100"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">No photos selected</p>
          </div>
        )}
        {photos.length > 4 && (
          <p className="text-xs text-gray-500 mt-2">
            +{photos.length - 4} more photo{photos.length - 4 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Background</h3>
        {selectedBackground ? (
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={selectedBackground.url}
              alt={selectedBackground.name}
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '16/9' }}
            />
            <div className="p-3 bg-white">
              <p className="text-sm font-medium text-gray-900">{selectedBackground.name}</p>
              <p className="text-xs text-gray-500 capitalize">{selectedBackground.category}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">No background selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
