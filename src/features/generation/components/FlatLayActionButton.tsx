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
    <div className="border-t dark:border-gray-700 pt-4">
      {/* Show error if any */}
      {generationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {generationError}
        </div>
      )}
      
      <button 
        disabled={!canProceed || isGenerating}
        onClick={onNextStep}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLastStep 
          ? 'Generate Image' 
          : 'Next Step'}
      </button>
    </div>
  );
}
