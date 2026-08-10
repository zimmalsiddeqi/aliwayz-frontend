import { cn } from '@lib/utils';

export default function BadgeUI({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) {
  const variants = {
    default: 'bg-[var(--glass-bg-strong)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    brand:   'badge-brand',
    success: 'badge-success',
    warning: 'badge-warning',
    danger:  'badge-danger',
    info:    'bg-[rgba(6,182,212,0.1)] text-[var(--color-info)] border-[rgba(6,182,212,0.2)]',
    purple:  'bg-[rgba(139,92,246,0.1)] text-accent-purple border-[rgba(139,92,246,0.2)]',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'badge',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-[var(--color-success)]',
            variant === 'warning' && 'bg-[var(--color-warning)]',
            variant === 'danger'  && 'bg-[var(--color-error)]',
            variant === 'brand'   && 'bg-[var(--color-brand)]',
            variant === 'default' && 'bg-[var(--color-text-muted)]',
          )}
        />
      )}
      {children}
    </span>
  );
}