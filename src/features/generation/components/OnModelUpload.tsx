"use client";

import { useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { UploadHeader } from './UploadHeader';
import { OnModelSampleGallery } from './OnModelSampleGallery';

interface OnModelUploadProps {
  photos: { [key: number]: string };
  onFileUpload: (index: number, file: File | null) => void;
  onClear: () => void;
  onSelectSample?: (imageUrl: string) => void;
  selectedSample?: string;
}

export function OnModelUpload({ photos, onFileUpload, onClear, onSelectSample, selectedSample }: OnModelUploadProps) {
  const [photoCount, setPhotoCount] = useState(1);

  const handleAddPhoto = () => {
    if (photoCount < 10) {
      setPhotoCount(photoCount + 1);
    }
  };

  const hasAnyPhotos = Object.keys(photos).length > 0;

  return (
    <div className="space-y-6 md:pt-0 pt-[4vh]">
      <UploadHeader
        title="On-Model Photos"
        onClearAll={onClear}
        showClearButton={hasAnyPhotos}
      />

      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {Array.from({ length: photoCount }).map((_, index) => {
          const hasImage = !!photos[index];

          return (
            <div key={index} className={`relative pb-4 ${index === 0 ? 'w-[85vw] max-w-[360px] md:w-60' : 'hidden md:block w-60'}`}>
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
                className={`block border-2 rounded-lg transition-colors relative overflow-hidden ${hasImage ? 'border-white dark:border-border hover:border-gray-200 dark:hover:border-border' : 'border-dashed border-gray-300 dark:border-border bg-gray-50 dark:bg-secondary'
                  }`}
                style={{ aspectRatio: '3/4', width: '100%' }}
              >
                {hasImage ? (
                    <div className="relative w-full h-full bg-white dark:bg-secondary cursor-pointer group">
                    <label htmlFor={`photo-${index}`} className="block w-full h-full cursor-pointer">
                      <img
                        src={photos[index]}
                        alt={`Model Photo ${index + 1}`}
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
                  <label htmlFor={`photo-${index}`} className="w-full h-full bg-gray-50 dark:bg-secondary rounded-lg cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-secondary transition-colors">
                    <Upload className="w-12 h-12 md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm md:text-xs text-gray-500 dark:text-gray-400 font-medium">Upload Photo</span>
                  </label>
                )}
              </div>
              {!hasImage && (
                <label
                  htmlFor={`photo-${index}`}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
                >
                    <div className="bg-white dark:bg-secondary rounded-full p-2 shadow-lg border-2 border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-accent hover:border-gray-400 dark:hover:border-border transition-colors">
                    <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </label>
              )}
            </div>
          );
        })}

        {/* Add More Photos Button - desktop only */}
        {photoCount < 10 && (
          <div className="relative w-60 pb-4 hidden md:block">
            <button
              onClick={handleAddPhoto}
              className="block border-2 border-dashed border-gray-300 dark:border-border rounded-lg hover:border-gray-400 dark:hover:border-border transition-colors relative overflow-hidden"
              style={{ aspectRatio: '3/4', width: '100%', backgroundColor: 'transparent' }}
            >
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm">Add More</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Sample Images Gallery */}
      {onSelectSample && (
        <OnModelSampleGallery
          onSelectSample={onSelectSample}
          selectedImage={selectedSample}
        />
      )}
    </div>
  );
}
