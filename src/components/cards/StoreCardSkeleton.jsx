import Skeleton from '@components/ui/Skeleton';

export default function StoreCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Skeleton variant="avatar" className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}