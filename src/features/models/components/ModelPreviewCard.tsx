interface ModelPreviewCardProps {
  name: string;
  gender: 'male' | 'female';
  ageRange: string;
  imageUrl: string;
}

export function ModelPreviewCard({
  name,
  gender,
  ageRange,
  imageUrl,
}: ModelPreviewCardProps) {
  return (
    <div className="border border-gray-200 dark:border-border rounded-2xl p-3 sm:p-4 bg-white dark:bg-secondary">
      <div className="flex gap-2 sm:gap-3 items-start">
        {/* Model Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 bg-gray-100 dark:bg-accent rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Model Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-foreground mb-1 sm:mb-2">Model</h3>
          
          <div className="space-y-0.5 sm:space-y-1.5">
            {/* Name */}
            <div className="flex items-center flex-wrap">
              <span className="text-xs text-gray-500 dark:text-muted-foreground w-14 sm:w-20">Name:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-foreground truncate">{name}</span>
            </div>

            {/* Gender */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-muted-foreground w-14 sm:w-20">Sex:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-foreground capitalize">{gender}</span>
            </div>

            {/* Age Range */}
            <div className="flex items-center flex-wrap">
              <span className="text-xs text-gray-500 dark:text-muted-foreground w-14 sm:w-20">Age:</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-foreground">{ageRange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
