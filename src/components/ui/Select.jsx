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
            'input-base appearance-none pr-10 cursor-pointer transition-all duration-200 hover:border-brand-500/50',
            hasError && 'border-[var(--color-error)]',
            !props.value && 'text-[var(--color-text-muted)]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
          }}
          {...props}
        >
          <option
            value=""
            disabled
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform"
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