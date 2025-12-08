import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

interface UploadedImagesGridProps {
  images: UploadedImage[];
  onRemoveImage: (id: string) => void;
}

export const UploadedImagesGrid: React.FC<UploadedImagesGridProps> = ({ images, onRemoveImage }) => {
  return (
    <div className="container mx-auto p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
              <div className="aspect-square relative bg-gray-50">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                    className="bg-gray-500 text-white rounded-full p-1.5 hover:bg-gray-600 transition-colors shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
