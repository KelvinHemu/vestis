import { useRef, useCallback, useState } from 'react';

interface ProductUploadProps {
  id: number;
  label: string;
  imageUrl?: string;
  onFileUpload: (id: number, file: File | null) => void;
}

export function ProductUpload({ id, label, imageUrl, onFileUpload }: ProductUploadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasImage = !!imageUrl;
  const [isFocused, setIsFocused] = useState(false);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          onFileUpload(id, file);
          break;
        }
      }
    }
  }, [id, onFileUpload]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative w-60 pb-4 focus:outline-none ${isFocused ? 'ring-2 ring-blue-400 ring-offset-2 rounded-lg' : ''}`}
      onPaste={handlePaste}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <input
        type="file"
        id={`product-${id}`}
        accept="image/*"
        onChange={(e) => {
          console.log('File input changed!', e.target.files);
          onFileUpload(id, e.target.files?.[0] || null);
        }}
        className="hidden"
      />
      <div
        className="block border-2 border-white rounded-lg hover:border-gray-200 transition-colors relative overflow-hidden"
        style={{ aspectRatio: '3/4', width: '100%', backgroundColor: 'transparent' }}
      >
        {hasImage ? (
          <div className="relative w-full h-full bg-white dark:bg-secondary cursor-pointer group">
            <label htmlFor={`product-${id}`} className="block w-full h-full cursor-pointer">
              <img
                src={imageUrl}
                alt={`Product ${label}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl?.substring(0, 50));
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully');
                  console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                  console.log('Image visible:', e.currentTarget.offsetWidth, 'x', e.currentTarget.offsetHeight);
                }}
              />
            </label>
          </div>
        ) : (
          <div className="w-full h-full bg-transparent rounded-lg"></div>
        )}
      </div>
      {!hasImage && (
        <label
          htmlFor={`product-${id}`}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
        >
          <div className="bg-white dark:bg-secondary rounded-full p-2 shadow-md border border-gray-200 dark:border-border">
            <svg className="w-4 h-4 text-gray-700 dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </label>
      )}
    </div>
  );
}
