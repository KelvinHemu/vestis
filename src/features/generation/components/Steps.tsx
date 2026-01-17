import { ChevronRight } from 'lucide-react';

interface StepsProps {
  steps: string[];
  onStepChange?: (stepIndex: number) => void;
  currentStep?: number;
  maxUnlockedStep?: number; // New prop to control which steps are accessible
}

export function Steps({ steps, onStepChange, currentStep = 0, maxUnlockedStep = 0 }: StepsProps) {
  const handleStepClick = (index: number) => {
    // Only allow clicking on unlocked steps or previous steps
    if (index <= maxUnlockedStep) {
      onStepChange?.(index);
    }
  };

  return (
    <div className="w-full mb-0">
      <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap py-3 px-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => handleStepClick(index)}
              disabled={index > maxUnlockedStep}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                currentStep === index
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : index <= maxUnlockedStep
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                  : 'text-gray-400 dark:text-gray-600 pointer-events-none opacity-50'
              }`}
            >
              {step}
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
