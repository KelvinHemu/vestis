"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/* ============================================
   MainContent Component
   Base layout wrapper for page content
   Includes optional back button and title area
   ============================================ */

interface MainContentProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

export function MainContent({ 
  title, 
  description, 
  showBackButton = true,
  children 
}: MainContentProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-gray-100 dark:bg-background h-screen overflow-hidden flex flex-col">
      {/* Header area with back button and title */}
      <div className="px-4 md:px-8 py-0 flex-shrink-0">
        {showBackButton && (
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="mb-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-200 dark:hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        {/* Title and description section */}
        <div className="space-y-0">
          {title && <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground">{title}</h1>}
          {description && <p className="text-xl text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {children || (
          <div className="p-8 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card w-full h-full flex items-center justify-center mx-4 md:mx-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Feature content coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
