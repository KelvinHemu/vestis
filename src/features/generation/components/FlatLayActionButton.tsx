interface FlatLayActionButtonProps {
  generationError: string | null;
  isGenerating: boolean;
  canProceed: boolean;
  currentStep: number;
  totalSteps: number;
  onNextStep: () => void;
}

export function FlatLayActionButton({
  generationError,
  isGenerating,
  canProceed,
  currentStep,
  totalSteps,
  onNextStep,
}: FlatLayActionButtonProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="md:border-t dark:border-gray-700 md:pt-4">
      {/* Show error if any */}
      {generationError && (
        <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs md:text-sm">
          {generationError}
        </div>
      )}
      
      <button 
        disabled={!canProceed || isGenerating}
        onClick={onNextStep}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm md:text-base"
      >
        {isLastStep 
          ? 'Generate Image' 
          : 'Next Step'}
      </button>
    </div>
  );
}
