import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import { ChevronDown } from 'lucide-react';

export default function StoreProducts({ products, isLoading, hasNextPage, isFetchingNextPage, onLoadMore }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState icon="📦" title="No products yet" description="This store hasn't listed anything yet." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} showSeller={false} />)}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" isLoading={isFetchingNextPage} onClick={onLoadMore} leftIcon={<ChevronDown size={16} />}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}