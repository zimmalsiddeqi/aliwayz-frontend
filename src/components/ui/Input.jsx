import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@lib/utils';

const Input = forwardRef(({
  className,
  type = 'text',
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  containerClassName,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword && showPassword ? 'text' : type;
  const hasError   = !!error;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="floating-label" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
               style={{ color: 'var(--color-text-muted)' }}>
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={cn(
            'input-base',
            leftIcon && 'pl-10',
            (rightIcon || (isPassword && showPasswordToggle)) && 'pr-10',
            hasError && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-red-500/20',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.name}-error` : undefined}
          {...props}
        />

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
               style={{ color: 'var(--color-text-muted)' }}>
            {rightIcon}
          </div>
        )}

        {hasError && !rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2"
               style={{ color: 'var(--color-error)' }}>
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {error && (
        <p id={`${props.name}-error`}
           className="text-xs flex items-center gap-1"
           style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;