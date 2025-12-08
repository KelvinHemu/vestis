interface BackgroundPreviewCardProps {
  name: string;
  category: string;
  imageUrl: string;
}

export function BackgroundPreviewCard({
  name,
  category,
  imageUrl,
}: BackgroundPreviewCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-3 sm:p-4 bg-white">
      <div className="flex gap-2 sm:gap-3 items-start">
        {/* Background Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Background Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Background</h3>
          
          <div className="space-y-0.5 sm:space-y-1.5">
            {/* Name */}
            <div className="flex items-center flex-wrap">
              <span className="text-xs text-gray-500 w-14 sm:w-20">Name:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{name}</span>
            </div>

            {/* Type/Category */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 w-14 sm:w-20">Type:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 capitalize truncate">{category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
