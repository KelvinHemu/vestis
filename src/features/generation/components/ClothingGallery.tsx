"use client";

import { useMemo } from 'react';

// Sample clothing data with paths to assets
const SAMPLE_CLOTHING = {
    tops: [
        { id: 'top-1', frontImage: '/sample/flatlay/1-top-front.webp', backImage: '/sample/flatlay/1-top-back.webp' },
        { id: 'top-2', frontImage: '/sample/flatlay/2-top-front.webp', backImage: '/sample/flatlay/2-top-back.webp' },
        { id: 'top-3', frontImage: '/sample/flatlay/3-top-front.webp', backImage: '/sample/flatlay/3-top-back.webp' },
        { id: 'top-4', frontImage: '/sample/flatlay/4-top-front.webp', backImage: '/sample/flatlay/4-top-back.webp' },
    ],
    bottoms: [
        { id: 'bottom-1', frontImage: '/sample/flatlay/1-bottom-front.webp', backImage: '/sample/flatlay/1-bottom-back.webp' },
        { id: 'bottom-2', frontImage: '/sample/flatlay/2-bottom-front.webp', backImage: '/sample/flatlay/2-bottom-back.webp' },
        { id: 'bottom-3', frontImage: '/sample/flatlay/3-bottom-front.webp', backImage: '/sample/flatlay/3-bottom-back.webp' },
        { id: 'bottom-4', frontImage: '/sample/flatlay/4-bottom-front.webp', backImage: '/sample/flatlay/4-bottom-back.webp' },
    ],
};

interface ClothingItem {
    id: string;
    frontImage: string;
    backImage: string;
}

interface ClothingGalleryProps {
    selectionType: ('top' | 'bottom')[];
    onSelectClothing: (type: 'top' | 'bottom', frontImage: string, backImage: string) => void;
    selectedTop?: string;
    selectedBottom?: string;
}

export function ClothingGallery({
    selectionType,
    onSelectClothing,
    selectedTop,
    selectedBottom,
}: ClothingGalleryProps) {
    // Determine which items to show based on selection type
    const itemsToShow = useMemo(() => {
        const items: { type: 'top' | 'bottom'; item: ClothingItem }[] = [];

        const showTops = selectionType.includes('top');
        const showBottoms = selectionType.includes('bottom');

        if (showTops) {
            SAMPLE_CLOTHING.tops.forEach(item => items.push({ type: 'top', item }));
        }
        if (showBottoms) {
            SAMPLE_CLOTHING.bottoms.forEach(item => items.push({ type: 'bottom', item }));
        }

        return items;
    }, [selectionType]);

    const handleSelectItem = (type: 'top' | 'bottom', item: ClothingItem) => {
        onSelectClothing(type, item.frontImage, item.backImage);
    };

    const isSelected = (type: 'top' | 'bottom', frontImage: string) => {
        if (type === 'top') {
            return selectedTop === frontImage;
        }
        return selectedBottom === frontImage;
    };

    if (itemsToShow.length === 0) {
        return null;
    }

    // Check if showing both types (for full body)
    const showingBothTypes = selectionType.includes('top') && selectionType.includes('bottom');

    return (
        <div className="mt-6 space-y-4">
            {/* Section for tops when showing both types */}
            {showingBothTypes ? (
                <>
                    {/* Tops Section */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tops</h4>
                        <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {SAMPLE_CLOTHING.tops.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectItem('top', item)}
                                    className={`
                    relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden
                    border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-800
                    ${isSelected('top', item.frontImage)
                                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                                        }
                  `}
                                >
                                    <img
                                        src={item.frontImage}
                                        alt={`Sample top ${item.id}`}
                                        className="w-full h-full object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottoms Section */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bottoms</h4>
                        <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {SAMPLE_CLOTHING.bottoms.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectItem('bottom', item)}
                                    className={`
                    relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden
                    border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-800
                    ${isSelected('bottom', item.frontImage)
                                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                                        }
                  `}
                                >
                                    <img
                                        src={item.frontImage}
                                        alt={`Sample bottom ${item.id}`}
                                        className="w-full h-full object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                /* Single type view */
                <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {itemsToShow.map(({ type, item }) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelectItem(type, item)}
                            className={`
                relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden
                border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-800
                ${isSelected(type, item.frontImage)
                                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                                }
              `}
                        >
                            <img
                                src={item.frontImage}
                                alt={`Sample ${type} ${item.id}`}
                                className="w-full h-full object-contain p-1"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
