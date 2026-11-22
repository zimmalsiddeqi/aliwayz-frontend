import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import SEOHead from '@components/seo/SEOHead';
import { buildBreadcrumbSchema } from '@components/seo/structuredData';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, PlusCircle } from 'lucide-react';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useLocationStore from '@store/location.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import PageHeader from '@components/common/PageHeader';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import EmptyState from '@components/common/EmptyState';
import useMediaQuery from '@hooks/useMediaQuery';
import useOnClickOutside from '@hooks/useOnClickOutside';
import { cn } from '@lib/utils';
import { ITEM_CONDITIONS, SORT_OPTIONS, DEFAULT_PAGE_SIZE } from '@utils/constants';
import { getMarketplaceCategories, isAutomotiveProduct, isRealEstateProduct } from '@utils/categoryHelpers';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    if (!filtersOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFiltersOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [filtersOpen]);
  const [viewMode, setViewMode] = useState('grid');

  const { isAuthenticated } = useAuthStore();
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

  const marketplaceCategories = useMemo(
    () => getMarketplaceCategories(categories),
    [categories]
  );

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

  // When browsing all categories on the Marketplace page, show only Marketplace items (exclude automotive and real estate)
  const products = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.data) || [];
    if (filters.category_id) return raw;
    return raw.filter((product) => !isAutomotiveProduct(product) && !isRealEstateProduct(product));
  }, [data?.pages, filters.category_id]);

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

  const clearFilters = () => {
    setSearchParams({});
    setFiltersOpen(false);
  };

  return (
    <>
      <SEOHead
        title="Marketplace — Browse All Items Locally on Aliwayz"
        description="Browse all local marketplace listings on Aliwayz. Discover great deals on electronics, vehicles, real estate, furniture, clothing, and more."
        canonical="/marketplace"
        structuredData={buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Marketplace', url: '/marketplace' },
        ])}
      />
      <div className="container-app py-6">
        <PageHeader
          title="Marketplace"
          subtitle={`${data?.pages?.[0]?.pagination?.total || 0} listings`}
          rightAction={
            <div className="flex items-center gap-2">
              <Link to={isAuthenticated ? '/sell/create?category=essentials' : '/login'}>
                <Button
                  variant="brand"
                  size="sm"
                  leftIcon={<PlusCircle size={14} />}
                  className="font-medium shadow-sm whitespace-nowrap"
                >
                  List an Item
                </Button>
              </Link>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltersOpen(true);
                }}
                className="relative ignore-click-outside"
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

        {/* Location (Removed redundant selector) */}

        {isLocated && radiusMiles !== 9999 && (
          <p className="mb-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            📍 Showing listings within {radiusMiles} miles of your location
          </p>
        )}

        <div>
          {/* Centered Filter Popup Modal (Portaled) */}
          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {filtersOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                  <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                  />
                  <motion.div
                    className="relative z-10 w-full max-w-sm rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 15 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                        Filters
                      </h3>
                      {activeFilterCount > 0 && (
                        <span className="flex h-5 px-2 items-center justify-center rounded-full bg-[var(--color-brand)] text-[10px] font-bold text-white shadow-sm">
                          {activeFilterCount} active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-semibold text-[var(--color-error)] hover:underline px-1.5 py-0.5 rounded transition-colors"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        onClick={() => setFiltersOpen(false)}
                        className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--color-text-primary)] transition-colors"
                        aria-label="Close filters"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 py-1">
                    <Select
                      label="Category"
                      placeholder="All Categories"
                      value={filters.category_id || ''}
                      onChange={(e) => updateFilter('category_id', e.target.value)}
                      options={marketplaceCategories.map((c) => ({ value: c.id, label: c.name }))}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Price Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.min_price || ''}
                          onChange={(e) => updateFilter('min_price', e.target.value)}
                          className="text-center text-xs py-2"
                        />
                        <span className="text-xs text-[var(--color-text-muted)] font-bold">—</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.max_price || ''}
                          onChange={(e) => updateFilter('max_price', e.target.value)}
                          className="text-center text-xs py-2"
                        />
                      </div>
                    </div>
                    <Select
                      label="Item Condition"
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
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={clearFilters}
                      className="flex-1 text-xs font-medium"
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="md"
                      onClick={() => setFiltersOpen(false)}
                      className="flex-1 text-xs font-medium"
                    >
                      Show Results
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

          <div className="w-full">
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
