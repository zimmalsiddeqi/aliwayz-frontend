import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import { ChevronDown } from 'lucide-react';

export default function SearchResults({ products, isLoading, hasNextPage, isFetchingNextPage, onLoadMore, query }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon="🔍"
        title="No results found"
        description={query ? `No products matching "${query}"` : 'Try different keywords'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
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