import { forwardRef } from 'react';
import { cn } from '@lib/utils';

const Textarea = forwardRef(({
  className,
  label,
  error,
  hint,
  maxLength,
  containerClassName,
  ...props
}, ref) => {
  const hasError = !!error;
  const charCount = props.value?.length || 0;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="floating-label" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        className={cn(
          'input-base min-h-[100px] resize-y',
          hasError && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
          className
        )}
        maxLength={maxLength}
        {...props}
      />

      <div className="flex justify-between">
        {error ? (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
        ) : hint ? (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
        ) : <span />}

        {maxLength && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;