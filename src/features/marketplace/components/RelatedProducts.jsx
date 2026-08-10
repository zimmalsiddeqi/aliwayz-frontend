import { useQuery } from '@tanstack/react-query';
import ProductService from '@api/services/product.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';

export default function RelatedProducts({ categoryId, excludeId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-products', categoryId, excludeId],
    queryFn:  () => ProductService.browse({ category_id: categoryId, limit: 4, page: 1 }).then((r) => ({
      data: r.data.filter((p) => p.id !== excludeId).slice(0, 4),
    })),
    enabled: !!categoryId,
  });

  const products = data?.data || [];
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
}