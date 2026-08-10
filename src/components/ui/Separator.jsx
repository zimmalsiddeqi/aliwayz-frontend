import { cn } from '@lib/utils';

export default function Separator({ className, label, ...props }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)} {...props}>
        <div className="flex-1 divider" />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        <div className="flex-1 divider" />
      </div>
    );
  }

  return <div className={cn('divider my-4', className)} {...props} />;
}