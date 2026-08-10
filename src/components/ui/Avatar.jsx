import { cn, getInitials } from '@lib/utils';
import { generateAvatarColor } from '@utils/helpers';

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  online,
  className,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const onlineSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border-[1.5px]',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
    '2xl': 'w-5 h-5 border-[3px]',
  };

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn(
            'rounded-full object-cover',
            sizes[size],
          )}
          style={{ border: '2px solid var(--color-border)' }}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold text-white',
            sizes[size],
            generateAvatarColor(name),
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            onlineSizes[size],
            online ? 'bg-accent-green' : 'bg-slate-500',
          )}
          style={{ borderColor: 'var(--color-surface)' }}
        />
      )}
    </div>
  );
}