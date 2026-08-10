import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import useLocationStore from '@store/location.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import PageHeader from '@components/common/PageHeader';
import LocationSelector from '@components/common/LocationSelector';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import EmptyState from '@components/common/EmptyState';
import useMediaQuery from '@hooks/useMediaQuery';
import { cn } from '@lib/utils';
import { ITEM_CONDITIONS, SORT_OPTIONS, DEFAULT_PAGE_SIZE } from '@utils/constants';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const { lat, lng, isLocated, radiusMiles } = useLocationStore();

  const filters = {
    category_id: searchParams.get('category_id') || undefined,
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    condition: searchParams.get('condition') || undefined,
    sort: searchParams.get('sort') || 'newest',
    city: searchParams.get('city') || undefined,
  };

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== 'newest').length;

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: queryKeys.products.all({ ...filters, lat, lng, radiusMiles }),
    queryFn: ({ pageParam = 1 }) =>
      ProductService.browse({
        ...filters,
        ...locationParams,
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      const pag = lastPage.pagination;
      return pag.has_next ? pag.page + 1 : undefined;
    },
  });

  const products = data?.pages.flatMap((page) => page.data) || [];

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== '' && value !== 'newest') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = () => setSearchParams({});

  return (
    <>
      <Helmet>
        <title>Marketplace — Aliwayz</title>
      </Helmet>
      <div className="container-app py-6">
        <PageHeader
          title="Marketplace"
          subtitle={`${data?.pages?.[0]?.pagination?.total || 0} listings`}
          rightAction={
            <div className="flex items-center gap-2">
              <div
                className="hidden items-center overflow-hidden rounded-xl sm:flex"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-[var(--color-brand)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-strong)]'
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-[var(--color-brand)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-strong)]'
                  )}
                >
                  <LayoutList size={16} />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="relative"
              >
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          }
        />

        {/* Location */}
        <div className="mb-4">
          <LocationSelector />
        </div>

        {isLocated && radiusMiles !== 9999 && (
          <p className="mb-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            📍 Showing listings within {radiusMiles} miles of your location
          </p>
        )}

        <div className="flex gap-6">
          <AnimatePresence>
            {filtersOpen && (
              <>
                {isMobile && (
                  <motion.div
                    className="fixed inset-0 z-40 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                  />
                )}
                <motion.aside
                  className={cn(
                    'z-50 flex-shrink-0 space-y-5',
                    isMobile
                      ? 'fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl p-6'
                      : 'sticky top-24 w-64 self-start'
                  )}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: isMobile ? undefined : '1px solid var(--color-border)',
                    borderRadius: isMobile ? undefined : 'var(--radius-2xl)',
                    padding: isMobile ? undefined : '1.25rem',
                    boxShadow: isMobile ? 'var(--shadow-xl)' : undefined,
                  }}
                  initial={isMobile ? { y: '100%' } : { opacity: 0, x: -20 }}
                  animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                  exit={isMobile ? { y: '100%' } : { opacity: 0, x: -20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Filters
                    </h3>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-medium"
                          style={{ color: 'var(--color-error)' }}
                        >
                          Clear all
                        </button>
                      )}
                      {isMobile && (
                        <button onClick={() => setFiltersOpen(false)} className="p-1">
                          <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                      )}
                    </div>
                  </div>
                  <Select
                    label="Category"
                    placeholder="All Categories"
                    value={filters.category_id || ''}
                    onChange={(e) => updateFilter('category_id', e.target.value)}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                  <div className="space-y-1.5">
                    <label className="floating-label">Price Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.min_price || ''}
                        onChange={(e) => updateFilter('min_price', e.target.value)}
                        className="text-center"
                      />
                      <span
                        className="flex items-center"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        —
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.max_price || ''}
                        onChange={(e) => updateFilter('max_price', e.target.value)}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <Select
                    label="Condition"
                    placeholder="Any Condition"
                    value={filters.condition || ''}
                    onChange={(e) => updateFilter('condition', e.target.value)}
                    options={ITEM_CONDITIONS}
                  />
                  <Select
                    label="Sort By"
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    options={SORT_OPTIONS}
                  />
                  <Input
                    label="City"
                    placeholder="Filter by city"
                    value={filters.city || ''}
                    onChange={(e) => updateFilter('city', e.target.value)}
                  />
                  {isMobile && (
                    <Button fullWidth onClick={() => setFiltersOpen(false)}>
                      Show Results
                    </Button>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div
                className={cn(
                  'grid gap-3 sm:gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2'
                )}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No listings found"
                description="Try adjusting your filters or search terms"
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div
                  className={cn(
                    'grid gap-3 sm:gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2'
                  )}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasNextPage && (
                  <div className="mt-8 flex justify-center">
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
        </div>
      </div>
    </>
  );
}
