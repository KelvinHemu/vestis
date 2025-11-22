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
    <div className="border border-gray-200 rounded-2xl p-4 bg-white">
      <div className="flex gap-3 items-start">
        {/* Background Image */}
        <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Background Details */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Background</h3>
          
          <div className="space-y-1.5">
            {/* Name */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 w-20">Name:</span>
              <span className="text-sm font-medium text-gray-900">{name}</span>
            </div>

            {/* Type/Category */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 w-20">Type:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
