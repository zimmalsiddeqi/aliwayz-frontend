import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';
import { cn } from '@lib/utils';

export default function ProductGrid({ products, isLoading, skeletonCount = 8, columns = 'default', emptyMessage = 'No products found' }) {
  const cols = {
    default: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    wide:    'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    narrow:  'grid-cols-1 sm:grid-cols-2',
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-3 sm:gap-4', cols[columns] || cols.default)}>
        {Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState icon="🔍" title={emptyMessage} />;
  }

  return (
    <div className={cn('grid gap-3 sm:gap-4', cols[columns] || cols.default)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}