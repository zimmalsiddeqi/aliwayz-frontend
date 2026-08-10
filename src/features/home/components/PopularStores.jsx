import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoreCard from '@components/cards/StoreCard';
import { StoreCardSkeleton } from '@components/ui/Skeleton';

export default function PopularStores() {
  // Use search to get top-rated stores sorted by rating
  const { data, isLoading } = useQuery({
    queryKey: ['popular-stores'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stores/popular`, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const stores = data?.data || [];
  if (!stores.length && !isLoading) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Popular Stores
        </h2>
        <Link to="/marketplace" className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <StoreCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.slice(0, 6).map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}