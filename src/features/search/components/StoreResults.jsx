import StoreCard from '@components/cards/StoreCard';
import { StoreCardSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';

export default function StoreResults({ stores, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return <EmptyState icon="🏪" title="No stores found" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}