"use client";

// Sample clothing data for on-model photos
const SAMPLE_IMAGES = [
    { id: 'onmodel-1', image: '/sample/onmodel/onmodel.jpg' },
];

interface OnModelSampleGalleryProps {
    onSelectSample: (imageUrl: string) => void;
    selectedImage?: string;
}

export function OnModelSampleGallery({
    onSelectSample,
    selectedImage,
}: OnModelSampleGalleryProps) {
    const isSelected = (imageUrl: string) => selectedImage === imageUrl;

    if (SAMPLE_IMAGES.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 space-y-4">
            <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {SAMPLE_IMAGES.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelectSample(item.image)}
                        className={`
              relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden
              border-2 transition-all duration-200 bg-gray-50
              ${isSelected(item.image)
                                ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                                : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                            }
            `}
                    >
                        <img
                            src={item.image}
                            alt={`Sample ${item.id}`}
                            className="w-full h-full object-cover p-1"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
