import { useQuery } from '@tanstack/react-query';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductService from '@api/services/product.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

export default function RecentSection() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.recent(1),
    queryFn:  () => ProductService.getRecent({ page: 1, limit: 8 }).then((r) => r.data),
  });

  const products = data || [];

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Clock size={18} style={{ color: 'var(--color-brand)' }} />
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Recently Added</h2>
        </div>
        <Link to="/marketplace?sort=newest" className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}