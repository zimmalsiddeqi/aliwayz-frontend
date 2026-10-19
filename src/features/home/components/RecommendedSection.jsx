import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import ProductService from '@api/services/product.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

export default function RecommendedSection() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.recommended(),
    queryFn:  () => ProductService.getRecommended().then((r) => r.data),
    enabled:  isAuthenticated,      // ← MUST have this
    staleTime: 5 * 60 * 1000,
    retry:     false,
  });

  const products = data || [];

  // Don't show section for guests or when empty
  if (!isAuthenticated || products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-5">
        <Sparkles size={18} style={{ color: 'var(--color-brand)' }} />
        <h2
          className="text-lg sm:text-xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Recommended for You
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}