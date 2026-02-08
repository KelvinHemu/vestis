import { ChevronRight, Check } from 'lucide-react';

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
      {/* Desktop: Full text buttons */}
      <div className="hidden md:flex items-center justify-center gap-2 py-3 px-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => handleStepClick(index)}
              disabled={index > maxUnlockedStep}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                currentStep === index
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : index <= maxUnlockedStep
                  ? 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer'
                  : 'text-gray-400 dark:text-muted-foreground pointer-events-none opacity-50'
              }`}
            >
              {step}
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Compact step indicator with numbers */}
      <div className="md:hidden py-3 px-4">
        {/* Step indicator dots/numbers */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => handleStepClick(index)}
                disabled={index > maxUnlockedStep}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep === index
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : index < currentStep
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : index <= maxUnlockedStep
                    ? 'bg-gray-200 dark:bg-accent text-gray-600 dark:text-muted-foreground'
                    : 'bg-gray-100 dark:bg-secondary text-gray-400 dark:text-muted-foreground opacity-50'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-6 h-0.5 ${
                  index < currentStep 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'bg-gray-200 dark:bg-accent'
                }`} />
              )}
            </div>
          ))}
        </div>
        {/* Current step label */}
        <p className="text-center text-sm font-medium text-gray-900 dark:text-foreground mt-2">
          {steps[currentStep]}
        </p>
      </div>
    </div>
  );
}
