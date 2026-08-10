import { cn } from '@lib/utils';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin border-transparent',
        sizes[size],
        className
      )}
      style={{
        borderTopColor: 'var(--color-brand)',
        borderRightColor: 'var(--color-brand)',
      }}
    />
  );
}