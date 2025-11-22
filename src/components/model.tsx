import { Card } from '@/components/ui/card';

// ============================================================================
// ModelCardInfo Component - Displays model metadata (name, age, size)
// Clean text-based design for displaying model information below the image
// ============================================================================

interface ModelCardInfoProps {
  name: string;
  age: string;
  size: string;
}

function ModelCardInfo({ name, age, size }: ModelCardInfoProps) {
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

// ============================================================================
// ModelCard Component - Main card displaying model with image and info
// ============================================================================

interface ModelCardProps {
  id: string;
  name: string;
  age: string;
  size: string;
  image: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ModelCard({ 
  name, 
  age, 
  size, 
  image, 
  isSelected = false, 
  onClick 
}: ModelCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden transition-all bg-white ${
        isSelected
          ? 'ring-2 ring-black shadow-lg'
          : 'hover:shadow-md'
      }`}
    >
      {/* Model Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Info Section - Below Image */}
      <ModelCardInfo name={name} age={age} size={size} />
    </Card>
  );
}

// ============================================================================
// Export ModelCardInfo for direct use if needed
// ============================================================================
export { ModelCardInfo };
