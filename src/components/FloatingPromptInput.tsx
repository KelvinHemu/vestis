import { Sparkles } from 'lucide-react';

interface FloatingPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function FloatingPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add more details about your image (optional)...",
  maxLength = 500
}: FloatingPromptInputProps) {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white rounded-full shadow-lg border border-gray-300 flex items-center gap-3 px-4 py-2.5">
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
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-base"
            maxLength={maxLength}
          />
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">
              {value.length}/{maxLength}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Generate with AI"
            >
              <Sparkles className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
