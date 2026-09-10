import { Check } from 'lucide-react';
import { cn } from '@lib/utils';

export default function WizardProgressBar({ currentStep, steps = ['Basics', 'Details', 'Features', 'Location', 'Review'] }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Background connector line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--color-border)] z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isDone
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isActive
                    ? 'border-2 border-blue-600 bg-white text-blue-600 shadow-md dark:bg-gray-900'
                    : 'border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'
                )}
              >
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              <span
                className={cn(
                  'mt-1 text-[10px] sm:text-[11px] font-semibold tracking-tight transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
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
    </div>
  );
}
