import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UploadHeader } from './UploadHeader';

interface BackgroundChangeUploadProps {
  photos: { [key: number]: string };
  onFileUpload: (index: number, file: File | null) => void;
  onClear: () => void;
}

export function BackgroundChangeUpload({ photos, onFileUpload, onClear }: BackgroundChangeUploadProps) {
  const [photoCount, setPhotoCount] = useState(1);

  const handleAddPhoto = () => {
    if (photoCount < 10) {
      setPhotoCount(photoCount + 1);
    }
  };

  const hasAnyPhotos = Object.keys(photos).length > 0;

  return (
    <div className="space-y-6">
      <UploadHeader
        title="Product Photos"
        onClearAll={onClear}
        showClearButton={hasAnyPhotos}
      />

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: photoCount }).map((_, index) => {
          const hasImage = !!photos[index];
          
          return (
            <div key={index} className="relative w-60 pb-4">
              <input
                type="file"
                id={`photo-${index}`}
                accept="image/*"
                onChange={(e) => {
                  console.log('File input changed!', e.target.files);
                  onFileUpload(index, e.target.files?.[0] || null);
                }}
                className="hidden"
              />
              <div
                className={`block border-2 rounded-lg transition-colors relative overflow-hidden ${
                  hasImage ? 'border-white hover:border-gray-200' : 'border-dashed border-gray-300 bg-gray-50'
                }`}
                style={{ aspectRatio: '3/4', width: '100%' }}
              >
                {hasImage ? (
                  <div className="relative w-full h-full bg-white cursor-pointer group">
                    <label htmlFor={`photo-${index}`} className="block w-full h-full cursor-pointer">
                      <img
                        src={photos[index]}
                        alt={`Product Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', photos[index]?.substring(0, 50));
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully');
                          console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                        }}
                      />
                      {/* Remove button overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFileUpload(index, null);
                          }}
                          className="bg-gray-500 text-white rounded-full p-1.5 hover:bg-gray-600 transition-colors shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-50 rounded-lg"></div>
                )}
              </div>
              {!hasImage && (
                <label
                  htmlFor={`photo-${index}`}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
                >
                  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </label>
              )}
            </div>
          );
        })}

        {/* Add More Photos Button */}
        {photoCount < 10 && (
          <div className="relative w-60 pb-4">
            <button
              onClick={handleAddPhoto}
              className="block border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors relative overflow-hidden"
              style={{ aspectRatio: '3/4', width: '100%', backgroundColor: 'transparent' }}
            >
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm">Add More</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
