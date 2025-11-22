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
    <div className="px-3 py-2">
      <div className="flex items-center justify-between">
        {/* Name - Left */}
        <div className="font-medium text-gray-900 text-base">
          {name}
        </div>
        
        {/* Age and Size - Right */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-300">
            {age}
          </span>
          <span className="text-sm text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-300">
            {size}
          </span>
        </div>
      </div>
    </div>
  );
}
