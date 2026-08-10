import { cn } from '@lib/utils';

export default function Skeleton({ className, variant = 'rect', ...props }) {
  const shapes = {
    rect:    'rounded-lg',
    circle:  'rounded-full',
    text:    'rounded h-4 w-3/4',
    title:   'rounded h-6 w-1/2',
    avatar:  'rounded-full w-10 h-10',
    card:    'rounded-2xl h-48',
    image:   'rounded-xl aspect-square',
    button:  'rounded-xl h-10 w-24',
  };

  return (
    <div
      className={cn('skeleton animate-shimmer', shapes[variant] || shapes.rect, className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/3" />
        <div className="flex justify-between items-center">
          <Skeleton variant="button" />
          <Skeleton variant="circle" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Skeleton variant="avatar" className="w-14 h-14 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" className="w-2/3" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton variant="avatar" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-3/4 h-3" />
      </div>
      <Skeleton variant="text" className="w-10 h-3" />
    </div>
  );
}