import Skeleton from '@components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3.5 space-y-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <Skeleton variant="circle" className="w-5 h-5" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}