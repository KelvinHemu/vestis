import { useState } from 'react';
import { ProductUpload } from './ProductUpload';
import { CustomDropdown } from '@/components/shared/CustomDropdown';
import { UploadHeader } from './UploadHeader';
import { ClothingGallery } from './ClothingGallery';

interface ProductSelectorProps {
  selectionType: ('top' | 'bottom')[];
  onSelectionTypeChange: (types: ('top' | 'bottom')[]) => void;
  imageUrls: { [key: number]: string };
  onFileUpload: (index: number, file: File | null) => void;
  onClear: () => void;
  onSelectGalleryClothing?: (type: 'top' | 'bottom', frontImage: string, backImage: string) => void;
  selectedGalleryTop?: string;
  selectedGalleryBottom?: string;
}

export function ProductSelector({
  selectionType,
  onSelectionTypeChange,
  imageUrls,
  onFileUpload,
  onClear,
  onSelectGalleryClothing,
  selectedGalleryTop,
  selectedGalleryBottom
}: ProductSelectorProps) {
  const handleSelectChange = (value: string) => {
    if (value === 'fullbody' || value === 'top-bottom') {
      onSelectionTypeChange(['top', 'bottom']);
    } else if (value === 'top') {
      onSelectionTypeChange(['top']);
    } else if (value === 'bottom') {
      onSelectionTypeChange(['bottom']);
    }
  };

  // Mobile: which side is currently shown (Front or Back)
  const [mobileView, setMobileView] = useState<'front' | 'back'>('front');

  const isFullBody = selectionType.length === 2 &&
    selectionType.includes('top') &&
    selectionType.includes('bottom');

  // Get current value for select
  const getCurrentValue = () => {
    if (isFullBody) return 'fullbody';
    if (selectionType.length === 1 && selectionType.includes('top')) return 'top';
    if (selectionType.length === 1 && selectionType.includes('bottom')) return 'bottom';
    return 'top'; // default to 'top' for better UX
  };

  // Determine which background image to show
  const getBackgroundImage = (bgImages: any) => {
    if (isFullBody) {
      return bgImages.fullbody;
    } else if (selectionType.includes('top') && !selectionType.includes('bottom')) {
      return bgImages.top;
    } else if (selectionType.includes('bottom') && !selectionType.includes('top')) {
      return bgImages.bottom;
    }
    return bgImages.fullbody; // default
  };

  return (
    <div className="space-y-4">
      <UploadHeader
        title="Flatlay Photos"
        onClearAll={onClear}
        showClearButton={Object.keys(imageUrls).length > 0}
      />

      {/* Selection Type Options - custom dropdown + Front/Back toggle on mobile */}
      <div className="flex items-center gap-3">
        <CustomDropdown
          value={getCurrentValue()}
          onChange={handleSelectChange}
          options={[
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'fullbody', label: 'Full Body' }
          ]}
          className="flex-1 sm:w-48 sm:flex-none"
        />

        {/* Mobile Front/Back toggle */}
        <div className="flex md:hidden items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMobileView('front')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mobileView === 'front' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Front
          </button>
          <button
            onClick={() => setMobileView('back')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mobileView === 'back' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Check if any card has an image - used for consistent sizing on mobile */}
      {(() => {
        const anyHasImage = Object.keys(imageUrls).length > 0;
        const cards = [
          {
            id: 1,
            label: 'Front',
            bgImages: {
              fullbody: '/images/flatlay/front-full.png',
              top: '/images/flatlay/front-top.png',
              bottom: '/images/flatlay/front-bottom.png'
            }
          },
          {
            id: 2,
            label: 'Back',
            bgImages: {
              fullbody: '/images/flatlay/full-back.png',
              top: '/images/flatlay/back-top.png',
              bottom: '/images/flatlay/back-bottom.png'
            }
          }
        ];
        
        return (
          <>
            {/* Mobile: single card with Front/Back toggle */}
            <div className="md:hidden w-full">
              {cards
                .filter((item) => mobileView === 'front' ? item.id === 1 : item.id === 2)
                .map((item) => {
                  const hasImage = !!imageUrls[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-3 shadow-sm relative flex items-center justify-center w-full mx-auto transition-colors duration-300 ${hasImage ? 'bg-white dark:bg-gray-900' : ''}`}
                      style={{
                        aspectRatio: anyHasImage ? undefined : '3/4',
                        minHeight: anyHasImage ? '180px' : undefined,
                        backgroundColor: hasImage ? undefined : '#e5e7eb'
                      }}
                    >
                      {!hasImage && (
                        <div
                          className="absolute inset-0 rounded-2xl dark:opacity-80"
                          style={{
                            backgroundImage: `url(${getBackgroundImage(item.bgImages)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            opacity: 1
                          }}
                        />
                      )}

                      <div className="relative z-10">
                        <ProductUpload
                          id={item.id}
                          label={item.label}
                          imageUrl={imageUrls[item.id]}
                          onFileUpload={onFileUpload}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Desktop: side by side cards */}
            <div className="hidden md:grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full items-stretch">
              {cards.map((item) => {
                const hasImage = !!imageUrls[item.id];
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm relative flex items-center justify-center w-full max-w-[550px] mx-auto md:mx-0 transition-colors duration-300 ${hasImage ? 'bg-white dark:bg-gray-900' : ''}`}
                    style={{
                      aspectRatio: anyHasImage ? undefined : '16/9',
                      minHeight: anyHasImage ? '200px' : undefined,
                      backgroundColor: hasImage ? undefined : '#e5e7eb'
                    }}
                  >
                    {!hasImage && (
                      <div
                        className="absolute inset-0 rounded-2xl dark:opacity-80"
                        style={{
                          backgroundImage: `url(${getBackgroundImage(item.bgImages)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 1
                        }}
                      />
                    )}

                    <h3 className={`absolute top-4 left-6 text-lg font-semibold z-10 ${hasImage ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'}`}>{item.label}</h3>
                    <div className="relative z-10">
                      <ProductUpload
                        id={item.id}
                        label={item.label}
                        imageUrl={imageUrls[item.id]}
                        onFileUpload={onFileUpload}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* Sample Clothing Gallery */}
      {onSelectGalleryClothing && (
        <ClothingGallery
          selectionType={selectionType}
          onSelectClothing={onSelectGalleryClothing}
          selectedTop={selectedGalleryTop}
          selectedBottom={selectedGalleryBottom}
        />
      )}
    </div>
  );
}
