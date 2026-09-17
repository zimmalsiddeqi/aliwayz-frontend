import Skeleton from '@components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none flex-shrink-0" />
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2">
        <div className="space-y-1">
          <Skeleton className="h-[1.9rem] sm:h-[2.3rem] w-full rounded-lg" />
          <div className="flex items-baseline justify-between gap-1">
            <Skeleton className="h-5 sm:h-6 w-1/2 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
            <Skeleton className="h-3 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-14 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5 pt-1.5" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <Skeleton variant="circle" className="w-4 h-4 rounded-md flex-shrink-0" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}