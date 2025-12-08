"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface Feature {
  id: number;
  title: string;
  description: string;
  path: string;
  backgroundImage?: string;
}

interface FeatureCardProps {
  feature: Feature;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const router = useRouter();

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden bg-white"
      onClick={() => router.push(feature.path)}
    >
      <div className="flex items-center h-full gap-3 sm:gap-3 p-2 sm:p-3">
        {/* Image Container - Left Side - Larger on mobile for single column */}
        <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-orange-200 via-yellow-100 to-green-200">
          {feature.backgroundImage ? (
            <img 
              src={feature.backgroundImage} 
              alt={feature.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 via-yellow-100 to-green-200" />
          )}
        </div>

        {/* Content Container - Right Side */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
          <h3 className="text-sm sm:text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
            {feature.title}
          </h3>
          
          <p className="text-xs sm:text-xs text-gray-600 leading-snug line-clamp-2">
            {feature.description}
          </p>
        </div>
      </div>
    </Card>
  );
};

export const features: Feature[] = [
  {
    id: 1,
    title: 'On-Model Photos',
    description: 'Switch models and backgrounds instantly.',
    path: '/on-model-photos',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763504494/onModel_xisqgv.jpg'
  },
  {
    id: 2,
    title: 'Flat-Lay Photos',
    description: 'Transform flat-lay into on-model images.',
    path: '/flat-lay-photos',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763503878/flatlay2_zxx6mq.jpg'
  },
  {
    id: 3,
    title: 'Mannequin Photos',
    description: 'Convert mannequin shots to models.',
    path: '/mannequin-photos',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763505343/manniquin_tuth1w.jpg'
  },
  {
    id: 4,
    title: 'Background-Change',
    description: 'Make product backgrounds pop.',
    path: '/background-change',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763567849/WhatsApp_Image_2025-11-19_at_18.56.47_7bf6a54e_rtheph.jpg'
  },

];
