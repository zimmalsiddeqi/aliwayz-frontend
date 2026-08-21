import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, SlidersHorizontal, MapPin, Search } from 'lucide-react';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import { DEFAULT_PAGE_SIZE, ITEM_CONDITIONS } from '@utils/constants';

export default function CategoryPage() {
  const { slug } = useParams();

  // Local filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('newest');
  const [city, setCity] = useState('');
  const [radiusKm, setRadiusKm] = useState('50');

  // Fetch category info
  const { data: catData } = useQuery({
    queryKey: queryKeys.categories.bySlug(slug),
    queryFn: () => CategoryService.getBySlug(slug, { page: 1, limit: 1 }),
    enabled: !!slug,
  });

  const category = catData?.data?.category;

  // Infinite query for products with all filters reactive
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['category-products', slug, minPrice, maxPrice, condition, sort, city, radiusKm],
    queryFn: ({ pageParam = 1 }) =>
      CategoryService.getBySlug(slug, {
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        condition: condition || undefined,
        sort: sort || undefined,
        city: city || undefined,
        radius_km: radiusKm || undefined,
      }),
    getNextPageParam: (lastPage) => {
      const pag = lastPage.pagination;
      return pag?.has_next ? pag.page + 1 : undefined;
    },
    enabled: !!slug,
  });

  const rawProducts = data?.pages.flatMap((p) => p.data?.products || p.data || []) || [];
  
  // Client-side search keyword filter for fast filtering within fetched category
  const products = searchKeyword.trim()
    ? rawProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : rawProducts;

  const totalCount = data?.pages?.[0]?.pagination?.total || 0;

  return (
    <>
      <Helmet>
        <title>{category?.name || 'Category'} — Aliwayz</title>
      </Helmet>

      <div className="container-app py-6">
        <PageHeader
          showBack
          title={category?.name || 'Category'}
          subtitle={`${totalCount} products available`}
        />

        {/* Filters and Search Bar Container */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search within category input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <input
                type="text"
                placeholder={`Search in ${category?.name || 'this category'}...`}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-brand)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--glass-bg-strong)]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>

          {/* Collapsible Local Discovery Filters */}
          {showFilters && (
            <div
              className="grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Location City */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Location City
                </label>
                <div className="relative flex items-center">
                  <MapPin size={16} className="absolute left-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="E.g. San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Distance Radius */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Distance Radius (km)
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full rounded-xl border p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                  <option value="100">Within 100 km</option>
                  <option value="500">Within 500 km</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Price Range ($)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Condition & Sort */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="">Any Condition</option>
                    {ITEM_CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Sort By
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-xl border p-2 text-xs outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="popular">Popularity</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching products"
            description="Try expanding your filters or search keywords!"
            actionLabel="Reset Filters"
            actionTo={() => {
              setSearchKeyword('');
              setMinPrice('');
              setMaxPrice('');
              setCondition('');
              setSort('newest');
              setCity('');
              setRadiusKm('50');
            }}
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