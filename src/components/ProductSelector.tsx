import { ProductUpload } from './ProductUpload';
import { CustomDropdown } from './CustomDropdown';
import { UploadHeader } from './UploadHeader';

interface ProductSelectorProps {
  selectionType: ('top' | 'bottom')[];
  onSelectionTypeChange: (types: ('top' | 'bottom')[]) => void;
  imageUrls: { [key: number]: string };
  onFileUpload: (index: number, file: File | null) => void;
  onClear: () => void;
}

export function ProductSelector({
  selectionType,
  onSelectionTypeChange,
  imageUrls,
  onFileUpload,
  onClear
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
      
      {/* Selection Type Options - custom dropdown */}
      <div className="flex justify-between items-center gap-3">
        <CustomDropdown
          value={getCurrentValue()}
          onChange={handleSelectChange}
          options={[
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'fullbody', label: 'Full Body' }
          ]}
          className="w-48"
        />
      </div>

      <div className="flex gap-8 justify-start">
        {/* Product cards */}
        {[
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
        ].map((item) => (
          <div 
            key={item.id} 
            className="rounded-2xl p-8 shadow-sm relative flex items-center justify-center" 
            style={{ 
              aspectRatio: '16/9', 
              width: '550px',
              backgroundColor: '#e5e7eb'
            }}
          >
            {/* Background Image Layer */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                backgroundImage: `url(${getBackgroundImage(item.bgImages)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 1
              }}
            />
            
            <h3 className="absolute top-4 left-6 text-lg font-semibold text-gray-700 z-10">{item.label}</h3>
            <div className="relative z-10">
              <ProductUpload
                id={item.id}
                label={item.label}
                imageUrl={imageUrls[item.id]}
                onFileUpload={onFileUpload}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
