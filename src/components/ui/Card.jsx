import { forwardRef } from 'react';
import { cn } from '@lib/utils';

const Card = forwardRef(({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
  const variants = {
    default:     'card',
    flat:        'card-flat',
    interactive: 'card-interactive',
    glass:       'glass-card',
  };

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant] || variants.default,
        hoverable && variant === 'default' && 'hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('px-5 pt-5 pb-0', className)} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('px-5 py-4', className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-5 pb-5 pt-0 flex items-center', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
export default Card;