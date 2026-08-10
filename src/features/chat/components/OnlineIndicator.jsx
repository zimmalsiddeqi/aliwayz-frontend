import { cn } from '@lib/utils';

export default function OnlineIndicator({ online, size = 'md', className }) {
  const sizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };

  return (
    <span
      className={cn('inline-block rounded-full flex-shrink-0', sizes[size], className)}
      style={{ backgroundColor: online ? 'var(--color-success)' : 'var(--color-text-muted)' }}
      title={online ? 'Online' : 'Offline'}
    />
  );
}