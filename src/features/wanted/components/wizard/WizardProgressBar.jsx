import { Check } from 'lucide-react';
import { cn } from '@lib/utils';

export default function WizardProgressBar({
  currentStep,
  steps = ['Basics', 'Details', 'Features', 'Location', 'Review'],
}) {
  const total = steps.length;
  // Progress percentage between center of first step (0%) and last step (100%)
  const progressPercent = total > 1 ? ((currentStep - 1) / (total - 1)) * 100 : 0;

  return (
    <div className="mb-6 sm:mb-8 max-w-md mx-auto px-3">
      {/* 1. Circle & Line Row with exact mathematical centering */}
      <div className="relative flex items-center justify-between">
        {/* Background track line - runs precisely between center of step 1 and step N */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px] bg-gray-200 dark:bg-gray-700/80 rounded-full z-0 overflow-hidden">
          {/* Animated Active Progress Fill Line */}
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-300 select-none',
                  isDone
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-100'
                    : isActive
                    ? 'bg-white dark:bg-gray-900 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-md ring-4 ring-indigo-500/20 scale-110'
                    : 'border-2 border-gray-200 dark:border-gray-700 bg-[var(--color-bg-card)] text-gray-400 dark:text-gray-500'
                )}
              >
                {isDone ? (
                  <Check size={16} className="stroke-[3] transition-transform duration-200" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Step Label below circle */}
              <span
                className={cn(
                  'absolute top-9 sm:top-10 text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors duration-200',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : isDone
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spacer for bottom labels */}
      <div className="h-6" />
    </div>
  );
}
