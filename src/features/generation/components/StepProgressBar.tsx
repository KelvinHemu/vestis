import type { LucideIcon } from 'lucide-react';

interface Step {
  num: number;
  label: string;
  icon: LucideIcon;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  theme?: 'light' | 'dark';
}

export function StepProgressBar({ steps, currentStep, theme = 'light' }: StepProgressBarProps) {
  const isDark = theme === 'dark';

  return (
    <div className="mb-10">
      <div className="flex items-start justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const isUpcoming = step.num > currentStep;

          return (
            <div key={step.num} className="flex items-start flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${isActive
                    ? isDark ? 'bg-white text-black shadow-lg scale-110' : 'bg-black text-white shadow-lg scale-110'
                    : isCompleted
                      ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                      : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                    }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isActive ? (
                    <Icon className="w-6 h-6" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${isUpcoming
                    ? isDark ? 'text-white/40' : 'text-gray-400'
                    : isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-12 flex items-center mx-4">
                  <div
                    className={`w-full h-1 rounded-full transition-colors duration-300 ${isCompleted
                      ? isDark ? 'bg-white' : 'bg-black'
                      : isDark ? 'bg-white/10' : 'bg-gray-200'
                      }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
