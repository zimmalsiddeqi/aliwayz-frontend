import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, PlusCircle, ChevronDown, ArrowLeft, X } from 'lucide-react';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useLocationStore from '@store/location.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import Button from '@components/ui/Button';
import Select from '@components/ui/Select';
import Input from '@components/ui/Input';
import EmptyState from '@components/common/EmptyState';
import LocationSelector from '@components/common/LocationSelector';
import { isSeller } from '@lib/utils';
import {
  REAL_ESTATE_TYPES,
  REAL_ESTATE_PURPOSE,
  BEDROOM_OPTIONS,
  CATEGORY_IDS,
} from '@utils/constants';
import { getCategoryIdsForMain, getSubcategories } from '@utils/categoryHelpers';

export default function PropertyPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { lat, lng, isLocated, radiusMiles } = useLocationStore();
  const canSell = isAuthenticated && isSeller(user?.role);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    sort: 'newest',
    city: '',
  });
  const setFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val }));

  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const propertyCategoryIds = getCategoryIdsForMain('property', allCategories);
  const propertySubcategories = getSubcategories('property', allCategories);

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['property-products', selectedSubCat, filters, searchQuery, lat, lng, radiusMiles],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedSubCat && propertyCategoryIds.length > 0) {
        const results = await Promise.all(
          propertyCategoryIds.map((catId) =>
            ProductService.browse({
              category_id: catId,
              page: pageParam,
              limit: 50,
              sort: filters.sort,
              ...locationParams,
              ...(filters.min_price && { min_price: filters.min_price }),
              ...(filters.max_price && { max_price: filters.max_price }),
              ...(filters.city && { city: filters.city }),
            }).catch(() => ({ data: [], pagination: { total: 0 } }))
          )
        );
        const allProducts = results.flatMap((r) => r.data || []);
        const totalCount = results.reduce((s, r) => s + (r.pagination?.total || 0), 0);
        allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return {
          data: allProducts.slice(0, 12),
          pagination: {
            page: pageParam,
            limit: 12,
            total: totalCount,
            has_next: allProducts.length > 12,
            total_pages: Math.ceil(totalCount / 12),
          },
        };
      }
      return ProductService.browse({
        category_id: selectedSubCat || CATEGORY_IDS.PROPERTY,
        page: pageParam,
        limit: 12,
        sort: filters.sort,
        ...locationParams,
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
        ...(filters.city && { city: filters.city }),
      });
    },
    getNextPageParam: (last) => (last.pagination?.has_next ? last.pagination.page + 1 : undefined),
    enabled: propertyCategoryIds.length > 0,
  });

  const products = data?.pages.flatMap((p) => p.data) || [];
  const total = data?.pages?.[0]?.pagination?.total || 0;
  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  return (
    <>
      <Helmet>
        <title>Real Estate — Aliwayz</title>
      </Helmet>
      <div className="pb-24 md:pb-10">
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.07]">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute select-none text-6xl"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 40 - 20}deg)`,
                }}
              >
                {['🏠', '🏢', '🏡', '🏗️', '🌍', '🏢', '🏪', '🚪'][i]}
              </span>
            ))}
          </div>
          <div className="container-app relative py-8 sm:py-12">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} /> Home
            </Link>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="mb-1 text-3xl font-bold text-white sm:text-4xl">🏠 Real Estate</h1>
                <p className="text-sm text-white/70">
                  {total} listing{total !== 1 ? 's' : ''} available
                </p>
              </div>
              {canSell && (
                <Link to="/sell/create?category=real-estate">
                  <Button
                    size="md"
                    leftIcon={<PlusCircle size={16} />}
                    className="!border-white/30 !bg-white/20 !text-white backdrop-blur-md hover:!bg-white/30"
                  >
                    List Property
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-5 max-w-xl">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, type..."
                  className="w-full rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-white/50 outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['All', 'For Sale', 'For Rent', 'Home', 'Apartment', 'Land'].map((item) => (
                <button
                  key={item}
                  onClick={() => (item === 'All' ? setSearchQuery('') : setSearchQuery(item))}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor:
                      (item === 'All' && !searchQuery) || searchQuery === item
                        ? 'white'
                        : 'rgba(255,255,255,0.15)',
                    color:
                      (item === 'All' && !searchQuery) || searchQuery === item
                        ? '#064E3B'
                        : 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container-app py-3">
          <LocationSelector />
        </div>

        <div className="container-app py-3">
          {propertySubcategories.length > 0 && (
            <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedSubCat('')}
                className="flex-shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: !selectedSubCat ? '#059669' : 'var(--color-surface)',
                  color: !selectedSubCat ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${!selectedSubCat ? '#059669' : 'var(--color-border)'}`,
                }}
              >
                All Listings
              </button>
              {propertySubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(selectedSubCat === sub.id ? '' : sub.id)}
                  className="flex-shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedSubCat === sub.id ? '#059669' : 'var(--color-surface)',
                    color: selectedSubCat === sub.id ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selectedSubCat === sub.id ? '#059669' : 'var(--color-border)'}`,
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {isLoading
                  ? 'Loading...'
                  : `${filteredProducts.length} listing${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>
              {isLocated && radiusMiles !== 9999 && (
                <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  📍 Within {radiusMiles} miles of your location
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                options={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price_asc', label: 'Price ↑' },
                  { value: 'price_desc', label: 'Price ↓' },
                  { value: 'popular', label: 'Popular' },
                ]}
                containerClassName="!space-y-0"
                className="!rounded-xl !py-2 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-6 grid grid-cols-2 gap-3 rounded-2xl p-4 sm:grid-cols-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Select
                  label="Type"
                  placeholder="All Types"
                  options={REAL_ESTATE_TYPES}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  label="Listing"
                  placeholder="Buy or Rent"
                  options={REAL_ESTATE_PURPOSE}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Input
                  label="Min Price"
                  type="number"
                  placeholder="$0"
                  onChange={(e) => setFilter('min_price', e.target.value)}
                />
                <Input
                  label="Max Price"
                  type="number"
                  placeholder="Any"
                  onChange={(e) => setFilter('max_price', e.target.value)}
                />
                <Select label="Beds" placeholder="Any" options={BEDROOM_OPTIONS} />
                <Input
                  label="City"
                  placeholder="Filter by city"
                  onChange={(e) => setFilter('city', e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="🏠"
              title={
                searchQuery ? `No listings matching "${searchQuery}"` : 'No real estate listed yet'
              }
              description={canSell ? 'List your first property!' : 'Check back later.'}
              actionLabel={canSell ? 'List Property' : undefined}
              actionTo={canSell ? '/sell/create?category=real-estate' : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
