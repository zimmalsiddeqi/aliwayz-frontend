import { useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@lib/queryClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Heart,
  ChevronDown,
  Grid3X3,
  LayoutList,
  Trash2,
} from 'lucide-react';
import FavoriteService from '@api/services/favorite.service';
import ProductCard from '@components/cards/ProductCard';
import useAuthStore from '@store/auth.store';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import {
  cn,
  formatPrice,
  getConditionLabel,
  getConditionColor,
  getErrorMessage,
} from '@lib/utils';
import { getPrimaryImage } from '@utils/helpers';
import { formatRelativeTime } from '@utils/formatters';
import toast from '@lib/toast';

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuthStore();

  console.warn('[Favorites Debug] Logged in user ID:', user?.id);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['favorites'],
    queryFn: ({ pageParam = 1 }) =>
      FavoriteService.getAll({
        page: pageParam,
        limit: 12,
      }),
    getNextPageParam: (last) =>
      last.pagination?.hasNextPage
        ? last.pagination.page + 1
        : undefined,
  });

  const rawData = data?.pages.flatMap((p) => {
    if (!p) return [];
    if (Array.isArray(p)) return p;
    if (p.data && Array.isArray(p.data)) return p.data;
    if (p.favorites && Array.isArray(p.favorites)) return p.favorites;
    return [p];
  }) || [];

  const total =
    data?.pages?.[0]?.pagination?.total || rawData.length || 0;

  // Extract products from ALL possible response shapes
  const products = rawData
    .map((item) => {
      if (!item) return null;

      // Case A: item is the product itself
      if (item.title) {
        return { ...item, is_favorited: true };
      }

      // Extract the nested product object (could be 'product', 'products', or an array)
      const nested = item.product || item.products;
      if (nested) {
        const prod = Array.isArray(nested) ? nested[0] : nested;
        if (prod && prod.title) {
          return { ...prod, is_favorited: true };
        }
      }

      return null;
    })
    .filter(Boolean);

  try {
    console.warn('[Favorites Debug] Raw data pages stringified:', JSON.stringify(data?.pages, null, 2));
  } catch (e) {
    console.warn('[Favorites Debug] Raw data pages (non-stringifiable):', data?.pages);
  }
  console.warn('[Favorites Debug] RawData parsed:', rawData);
  console.warn('[Favorites Debug] Products mapped:', products);

  if (isError) {
    console.error('[Favorites Debug] Infinite query error:', error);
  }

  // Remove from favorites
  const removeMutation = useMutation({
    mutationFn: (productId) =>
      FavoriteService.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites() });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Removed from favorites');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Helmet>
        <title>Favorites — Aliwayz</title>
      </Helmet>

      <div className="container-app py-4 sm:py-6 pb-24 md:pb-8">
        <PageHeader
          showBack
          title="Favorites"
          subtitle={`${total} saved item${total !== 1 ? 's' : ''}`}
          rightAction={
            products.length > 0 && (
              <div
                className="flex rounded-xl overflow-hidden"
                style={{
                  border:
                    '1px solid var(--color-border)',
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 transition-colors"
                  style={{
                    backgroundColor:
                      viewMode === 'grid'
                        ? 'var(--color-brand)'
                        : 'transparent',
                    color:
                      viewMode === 'grid'
                        ? 'white'
                        : 'var(--color-text-muted)',
                  }}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 transition-colors"
                  style={{
                    backgroundColor:
                      viewMode === 'list'
                        ? 'var(--color-brand)'
                        : 'transparent',
                    color:
                      viewMode === 'list'
                        ? 'white'
                        : 'var(--color-text-muted)',
                  }}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            )
          }
        />

        {isLoading ? (
          <div
            className={cn(
              'grid gap-3 sm:gap-4',
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="⚠️"
            title="Failed to load favorites"
            description={getErrorMessage(error) || "There was a problem communicating with the server."}
            actionLabel="Try Again"
            onAction={() => refetch()}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="No favorites yet"
            description="Tap the heart icon on products you love to save them here."
            actionLabel="Browse Marketplace"
            actionTo="/marketplace"
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product, i) => {
                  const image = getPrimaryImage(
                    product.product_images
                  );
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.04,
                      }}
                    >
                      <Card className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          <Link
                            to={`/product/${product.id}`}
                            className="flex-shrink-0"
                          >
                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                              />
                            ) : (
                              <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    'var(--color-surface-elevated)',
                                }}
                              >
                                <span className="text-2xl opacity-30">
                                  📦
                                </span>
                              </div>
                            )}
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${product.id}`}
                            >
                              <h4
                                className="font-semibold text-sm truncate hover:underline"
                                style={{
                                  color:
                                    'var(--color-text-primary)',
                                }}
                              >
                                {product.title}
                              </h4>
                            </Link>
                            <p className="text-base font-bold mt-0.5 text-gradient-brand">
                              {formatPrice(
                                product.price,
                                product.currency
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                  getConditionColor(
                                    product.condition
                                  )
                                )}
                              >
                                {getConditionLabel(
                                  product.condition
                                )}
                              </span>
                              <span
                                className="text-[11px]"
                                style={{
                                  color:
                                    'var(--color-text-muted)',
                                }}
                              >
                                {formatRelativeTime(
                                  product.created_at
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              removeMutation.mutate(
                                product.id
                              )
                            }
                            disabled={
                              removeMutation.isPending
                            }
                            className="p-2 rounded-xl transition-all hover:bg-red-500/10 flex-shrink-0 self-center"
                            style={{
                              color:
                                'var(--color-error)',
                            }}
                          >
                            <Heart
                              size={18}
                              fill="currentColor"
                            />
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {hasNextPage && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  isLoading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  leftIcon={
                    <ChevronDown size={16} />
                  }
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}