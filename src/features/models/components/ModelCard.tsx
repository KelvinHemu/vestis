import { Card } from '@/components/ui/card';
import { ModelCardInfo } from './ModelCardInfo';

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
