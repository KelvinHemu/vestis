// ============================================================================
// ModelCardInfo Component - Displays model metadata (name, age, size)
// Clean text-based design for displaying model information below the image
// ============================================================================

interface ModelCardInfoProps {
  name: string;
  age: string;
  size: string;
}

export function ModelCardInfo({ name, age, size }: ModelCardInfoProps) {
  return (
    <div className="px-2 sm:px-3 py-1">
      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        {/* Name - Left */}
        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[45%] sm:max-w-none">
          {name}
        </div>

        {/* Age and Size - Right */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-600 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-gray-300 whitespace-nowrap">
            {age}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-gray-300 whitespace-nowrap">
            {size}
          </span>
        </div>
      </div>
    </div>
  );
}
