import { Sparkles } from 'lucide-react';

interface FloatingPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function FloatingPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add more details about your image (optional)...",
  maxLength = 500,
  disabled = false
}: FloatingPromptInputProps) {
  const handleSubmit = () => {
    if (onSubmit && value.trim() && !disabled) {
      onSubmit();
    }
  };
  return (
    <div className="hidden md:block fixed md:bottom-4 left-0 md:left-[80px] right-0 md:right-80 lg:right-96 px-3 py-2 md:p-4 bg-gradient-to-t from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pointer-events-none z-[40]">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-300 dark:border-gray-600 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={disabled ? "Generating..." : placeholder}
            className={`flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base min-w-0 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            maxLength={maxLength}
            disabled={disabled}
          />
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {value.length}/{maxLength}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${disabled || !value.trim() ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              aria-label="Generate with AI"
            >
              <Sparkles className={`w-4 h-4 ${disabled ? 'animate-pulse text-gray-500' : 'text-gray-700 dark:text-gray-300'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
