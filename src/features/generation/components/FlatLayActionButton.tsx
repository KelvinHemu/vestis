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
    <div className="border-t pt-4">
      {/* Show error if any */}
      {generationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {generationError}
        </div>
      )}
      
      <button 
        disabled={!canProceed || isGenerating}
        onClick={onNextStep}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLastStep 
          ? 'Generate Image' 
          : 'Next Step'}
      </button>
    </div>
  );
}
