import { useParams, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import { DEFAULT_PAGE_SIZE } from '@utils/constants';

export default function CategoryPage() {
  const { slug } = useParams();

  const { data: catData } = useQuery({
    queryKey: queryKeys.categories.bySlug(slug),
    queryFn:  () => CategoryService.getBySlug(slug, { page: 1, limit: DEFAULT_PAGE_SIZE }),
    enabled:  !!slug,
  });

  const category = catData?.data?.category;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['category-products', slug],
    queryFn:  ({ pageParam = 1 }) =>
      CategoryService.getBySlug(slug, { page: pageParam, limit: DEFAULT_PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      const pag = lastPage.pagination;
      return pag?.has_next ? pag.page + 1 : undefined;
    },
    enabled: !!slug,
  });

  const products = data?.pages.flatMap((p) => p.data?.products || p.data || []) || [];

  return (
    <>
      <Helmet>
        <title>{category?.name || 'Category'} — Aliwayz</title>
      </Helmet>

      <div className="container-app py-6">
        <PageHeader
          showBack
          title={category?.name || 'Category'}
          subtitle={`${data?.pages?.[0]?.pagination?.total || 0} products`}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No products in this category"
            description="Be the first to list something!"
            actionLabel="Browse All"
            actionTo="/marketplace"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  isLoading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  leftIcon={<ChevronDown size={16} />}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}