import Skeleton from '@components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full bg-surface border border-border rounded-2xl">
      <Skeleton className="aspect-square w-full rounded-none flex-shrink-0" />
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5">
          <Skeleton className="h-[2.35rem] sm:h-[2.65rem] w-full rounded-lg" />
          <div className="min-h-[2.5rem] flex flex-col justify-center gap-1">
            <Skeleton className="h-5 sm:h-6 w-1/2 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <Skeleton className="h-3 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-14 rounded-md" />
          </div>
          <div className="flex items-center gap-2 pt-2 h-7 sm:h-8" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <Skeleton variant="circle" className="w-4 h-4 sm:w-5 sm:h-5 rounded-md flex-shrink-0" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}