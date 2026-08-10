import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        brand:     'btn-brand',
        secondary: 'btn-secondary',
        ghost:     'btn-ghost',
        danger:    'btn-danger',
        outline:   'border bg-transparent hover:bg-[var(--glass-bg-strong)]',
        link:      'underline-offset-4 hover:underline text-[var(--color-brand)] p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-lg',
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-5 text-sm rounded-xl',
        lg: 'h-12 px-6 text-sm rounded-xl',
        xl: 'h-14 px-8 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant:   'brand',
      size:      'md',
      fullWidth: false,
    },
  }
);

const Button = forwardRef(({
  className,
  variant,
  size,
  fullWidth,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      style={{
        borderColor: variant === 'outline' ? 'var(--color-border)' : undefined,
        color: variant === 'outline' ? 'var(--color-text-primary)' : undefined,
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;