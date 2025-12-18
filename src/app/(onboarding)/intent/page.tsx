"use client";

import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

/* ============================================
   Intent Selection Page
   First screen of onboarding flow
   Forces user to choose what they want to create
   No skip option - selection is mandatory
   Uses same visual cards as dashboard with 3:4 aspect ratio
   ============================================ */

export const dynamic = "force-dynamic";

// Intent options with visual cards matching dashboard style
const intentOptions = [
  {
    id: 'on_model' as const,
    title: 'On-Model Photos',
    description: 'Switch models and backgrounds instantly.',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763504494/onModel_xisqgv.jpg'
  },
  {
    id: 'flat_lay' as const,
    title: 'Flat-Lay Photos',
    description: 'Transform flat-lay into on-model images.',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763503878/flatlay2_zxx6mq.jpg'
  },
  {
    id: 'mannequin' as const,
    title: 'Mannequin Photos',
    description: 'Convert mannequin shots to models.',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763505343/manniquin_tuth1w.jpg'
  },
  {
    id: 'background_change' as const,
    title: 'Background Change',
    description: 'Make product backgrounds pop.',
    backgroundImage: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763567849/WhatsApp_Image_2025-11-19_at_18.56.47_7bf6a54e_rtheph.jpg'
  },
];

export default function IntentPage() {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const { selectIntent } = useOnboarding();

  // Handle intent selection and navigation
  const handleContinue = () => {
    if (!selectedIntent) return;
    
    selectIntent(selectedIntent as 'on_model' | 'flat_lay' | 'mannequin' | 'background_change');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What do you want to create today?
        </h1>
        <p className="text-base text-gray-600">
          Choose the type of image you'd like to generate
        </p>
      </div>

      {/* Intent options - grid of visual cards with 3:4 aspect ratio */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {intentOptions.map((option) => {
          const isSelected = selectedIntent === option.id;
          
          return (
            <Card
              key={option.id}
              className={`
                group cursor-pointer transition-all duration-300 
                border rounded-2xl overflow-hidden bg-white relative
                ${isSelected 
                  ? 'border-4 border-black shadow-2xl ring-4 ring-black ring-opacity-10' 
                  : 'border-2 border-gray-200 hover:border-gray-400 hover:shadow-xl'
                }
              `}
              onClick={() => setSelectedIntent(option.id)}
            >
              {/* 3:4 Aspect Ratio Container */}
              <div className="relative" style={{ aspectRatio: '3/4' }}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  {option.backgroundImage ? (
                    <img
                      src={option.backgroundImage}
                      alt={option.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 via-yellow-100 to-green-200" />
                  )}
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Selection indicator - top right */}
                <div className="absolute top-2 right-2 z-10">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                    ${isSelected 
                      ? 'bg-black border-2 border-white shadow-lg scale-110' 
                      : 'bg-white/80 border-2 border-gray-300 group-hover:scale-105'
                    }
                  `}>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Content overlay - bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
                  <h3 className="text-sm font-bold mb-1 leading-tight">
                    {option.title}
                  </h3>
                  <p className="text-xs text-white/90 leading-snug line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedIntent}
          className="px-8 py-3 text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Continue
        </Button>
      </div>

      {/* Helper text */}
      {!selectedIntent && (
        <p className="text-center text-xs text-gray-500 mt-3">
          Select an option to continue
        </p>
      )}
    </div>
  );
}

