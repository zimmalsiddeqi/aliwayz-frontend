import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@lib/utils';

const Select = forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select...',
  containerClassName,
  ...props
}, ref) => {
  const hasError = !!error;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="floating-label" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'input-base appearance-none pr-10 cursor-pointer',
            hasError && 'border-[var(--color-error)]',
            !props.value && 'text-[var(--color-text-muted)]',
            className
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;