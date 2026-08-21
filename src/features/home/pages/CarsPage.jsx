import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import useMediaQuery from '@hooks/useMediaQuery';
import { isSeller, cn } from '@lib/utils';
import SearchCategoriesModal from '../components/SearchCategoriesModal';
import {
  VEHICLE_MAKES,
  VEHICLE_BODY_TYPES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_CONDITIONS,
  CATEGORY_IDS,
  SORT_OPTIONS,
} from '@utils/constants';
import { getCategoryIdsForMain, getSubcategories } from '@utils/categoryHelpers';

export default function CarsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { lat, lng, isLocated, radiusMiles } = useLocationStore();
  const canSell = isAuthenticated && isSeller(user?.role);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [searchCategoriesOpen, setSearchCategoriesOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    condition: '',
    sort: 'newest',
  });

  const setFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val }));

  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const carCategoryIds = getCategoryIdsForMain('cars', allCategories);
  const carSubcategories = getSubcategories('cars', allCategories);

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['vehicles-products', selectedSubCat, filters, searchQuery, lat, lng, radiusMiles],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedSubCat && carCategoryIds.length > 0) {
        const results = await Promise.all(
          carCategoryIds.map((catId) =>
            ProductService.browse({
              category_id: catId,
              page: pageParam,
              limit: 50,
              sort: filters.sort,
              ...locationParams,
              ...(filters.min_price && { min_price: filters.min_price }),
              ...(filters.max_price && { max_price: filters.max_price }),
              ...(filters.condition && { condition: filters.condition }),
            }).catch(() => ({ data: [], pagination: { total: 0, has_next: false } }))
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
        category_id: selectedSubCat || CATEGORY_IDS.AUTOMOTIVE,
        page: pageParam,
        limit: 12,
        sort: filters.sort,
        ...locationParams,
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
        ...(filters.condition && { condition: filters.condition }),
      });
    },
    getNextPageParam: (last) => (last.pagination?.has_next ? last.pagination.page + 1 : undefined),
    enabled: carCategoryIds.length > 0,
  });

  const products = data?.pages.flatMap((p) => p.data) || [];
  const total = data?.pages?.[0]?.pagination?.total || 0;
  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  return (
    <>
      <Helmet>
        <title>Automotive — Aliwayz</title>
      </Helmet>
      <div className="pb-24 md:pb-10">
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #3B82F6 100%)' }}
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
                {['🚗', '🏎️', '🚙', '🛻', '🏍️', '⚙️', '🔧', '🛞'][i]}
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
                <h1 className="mb-1 text-3xl font-bold text-white sm:text-4xl">🚗 Automotive</h1>
                <p className="text-sm text-white/70">
                  {total} listing{total !== 1 ? 's' : ''} listed
                </p>
              </div>
              {canSell && (
                <Link to="/sell/create?category=vehicles">
                  <Button
                    size="md"
                    leftIcon={<PlusCircle size={16} />}
                    className="!border-white/30 !bg-white/20 !text-white backdrop-blur-md hover:!bg-white/30"
                  >
                    Sell Automotive
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
                  placeholder="Search by make, model, year..."
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
              {['All', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Tesla'].map((make) => (
                <button
                  key={make}
                  onClick={() => (make === 'All' ? setSearchQuery('') : setSearchQuery(make))}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor:
                      (make === 'All' && !searchQuery) || searchQuery === make
                        ? 'white'
                        : 'rgba(255,255,255,0.15)',
                    color:
                      (make === 'All' && !searchQuery) || searchQuery === make
                        ? '#1E3A5F'
                        : 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {make}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Filters */}
        <div className="container-app py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <LocationSelector compact={isMobile} />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                options={SORT_OPTIONS}
                containerClassName="!space-y-0"
                className="!rounded-xl !py-2 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="container-app py-2">
          {carSubcategories.length > 0 && (
            <div className="-mx-4 sm:mx-0 mb-4 flex items-center justify-start gap-1.5 sm:gap-2 px-4 sm:px-0 overflow-x-auto pb-2 flex-nowrap w-full scrollbar-none">
              <button
                onClick={() => setSelectedSubCat('')}
                className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all"
                style={{
                  backgroundColor: !selectedSubCat ? '#2563EB' : 'var(--color-surface)',
                  color: !selectedSubCat ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${!selectedSubCat ? '#2563EB' : 'var(--color-border)'}`,
                }}
              >
                <span className="text-[12px] sm:text-sm">🌟</span> All Automotive
              </button>
              {carSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(selectedSubCat === sub.id ? '' : sub.id)}
                  className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedSubCat === sub.id ? '#2563EB' : 'var(--color-surface)',
                    color: selectedSubCat === sub.id ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selectedSubCat === sub.id ? '#2563EB' : 'var(--color-border)'}`,
                  }}
                >
                  {sub.name}
                </button>
              ))}
              <button
                onClick={() => setSearchCategoriesOpen(true)}
                className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all hover:bg-[var(--glass-bg-strong)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span className="text-[12px] sm:text-sm">🔍</span> All Categories
              </button>
            </div>
          )}

          <div className="mb-4">
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

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-6 grid grid-cols-2 gap-3 rounded-2xl p-4 sm:grid-cols-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Select
                  label="Make"
                  placeholder="All Makes"
                  options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select label="Body Type" placeholder="All Types" options={VEHICLE_BODY_TYPES} />
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
                <Select label="Fuel" placeholder="Any" options={VEHICLE_FUEL_TYPES} />
                <Select label="Transmission" placeholder="Any" options={VEHICLE_TRANSMISSIONS} />
                <Select
                  label="Condition"
                  placeholder="Any"
                  options={VEHICLE_CONDITIONS}
                  onChange={(e) => setFilter('condition', e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      setFilters({ min_price: '', max_price: '', condition: '', sort: 'newest' })
                    }
                  >
                    Clear All
                  </Button>
                </div>
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
              icon="🚗"
              title={
                searchQuery ? `No listings matching "${searchQuery}"` : 'No automotive listings yet'
              }
              description={canSell ? 'Be the first to list yours!' : 'Check back later.'}
              actionLabel={canSell ? 'Sell Automotive' : undefined}
              actionTo={canSell ? '/sell/create?category=vehicles' : undefined}
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
                    Load More Listings
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <SearchCategoriesModal
        isOpen={searchCategoriesOpen}
        onClose={() => setSearchCategoriesOpen(false)}
        categories={carSubcategories}
        onSelect={(cat) => {
          setSelectedSubCat(cat.id);
          setSearchCategoriesOpen(false);
        }}
      />
    </>
  );
}
