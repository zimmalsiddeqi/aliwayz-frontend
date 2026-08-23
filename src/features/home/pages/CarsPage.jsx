import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, PlusCircle, ChevronDown, ArrowLeft, X, MapPin } from 'lucide-react';
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
import { isSeller } from '@lib/utils';
import {
  VEHICLE_MAKES,
  VEHICLE_BODY_TYPES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_CONDITIONS,
  CATEGORY_IDS,
} from '@utils/constants';
import { getCategoryIdsForMain, getSubcategories } from '@utils/categoryHelpers';

export default function CarsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { lat, lng, isLocated, radiusMiles, city: locationCity, state: locationState } = useLocationStore();
  const canSell = isAuthenticated && isSeller(user?.role);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  
  // Detailed filter states
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
    queryKey: ['vehicles-products', selectedSubCat, sortBy, lat, lng, radiusMiles],
    queryFn: async ({ pageParam = 1 }) => {
      const catId = selectedSubCat || CATEGORY_IDS.AUTOMOTIVE;
      const response = await ProductService.browse({
        category_id: catId,
        page: pageParam,
        limit: 50,
        sort: sortBy,
        ...locationParams,
      }).catch(() => ({ data: [], pagination: { total: 0, has_next: false } }));
      
      return response;
    },
    getNextPageParam: (last) => (last.pagination?.has_next ? last.pagination.page + 1 : undefined),
    enabled: carCategoryIds.length > 0,
  });

  const products = data?.pages.flatMap((p) => p.data) || [];

  // Local/client filters application
  const filteredProducts = products.filter((p) => {
    // Text search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brand && p.brand.toLowerCase().includes(q);
      const matchDesc = p.description && p.description.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchDesc) return false;
    }

    // Make Filter
    if (selectedMake && p.brand !== selectedMake) return false;

    // Price Filter
    const price = Number(p.price);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;

    // Condition Filter
    if (selectedCondition && p.condition !== selectedCondition) return false;

    // Body Type, Fuel, and Transmission filters (parsed from description attributes if saved)
    if (selectedBodyType || selectedFuel || selectedTransmission) {
      const desc = p.description ? p.description.toLowerCase() : '';
      if (selectedBodyType && !desc.includes(selectedBodyType.toLowerCase())) return false;
      if (selectedFuel && !desc.includes(selectedFuel.toLowerCase())) return false;
      if (selectedTransmission && !desc.includes(selectedTransmission.toLowerCase())) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSubCat('');
    setSelectedMake('');
    setSelectedBodyType('');
    setSelectedFuel('');
    setSelectedTransmission('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <>
      <Helmet>
        <title>Automotive — Aliwayz</title>
      </Helmet>
      <div className="pb-24 md:pb-10">
        {/* Shrunk blue hero banner */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)' }}
        >
          <div className="container-app relative py-5 sm:py-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
              >
                <ArrowLeft size={14} /> Home
              </Link>
              {canSell && (
                <Link to="/sell/create?category=vehicles">
                  <Button
                    size="xs"
                    leftIcon={<PlusCircle size={14} />}
                    className="!border-white/35 !bg-white/20 !text-white backdrop-blur-md hover:!bg-white/30"
                  >
                    Sell Automotive
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-2.5">
              <h1 className="text-xl font-bold text-white flex items-center gap-1.5 sm:text-2xl">
                🚗 Automotive
              </h1>
              <p className="text-xs text-white/70">Find cars, trucks, parts & accessories near you</p>
            </div>

            {/* Combined Search bar */}
            <div className="mt-4 max-w-xl relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, year..."
                className="w-full rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-white/50 outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Segment Toggle: Categories */}
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedSubCat('')}
                className="rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border"
                style={{
                  backgroundColor: !selectedSubCat ? 'white' : 'rgba(255,255,255,0.1)',
                  color: !selectedSubCat ? '#1E3A5F' : 'white',
                  borderColor: !selectedSubCat ? 'white' : 'rgba(255,255,255,0.2)',
                }}
              >
                All Automotive
              </button>
              {carSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border"
                  style={{
                    backgroundColor: selectedSubCat === sub.id ? 'white' : 'rgba(255,255,255,0.1)',
                    color: selectedSubCat === sub.id ? '#1E3A5F' : 'white',
                    borderColor: selectedSubCat === sub.id ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & filter controls */}
        <div className="container-app py-3">
          <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-1 text-sm font-semibold truncate text-[var(--color-text-primary)]">
              {/* Removed redundant location selector */}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price_asc', label: 'Price ↑' },
                  { value: 'price_desc', label: 'Price ↓' },
                ]}
                containerClassName="!space-y-0"
                className="!rounded-xl !py-2 text-xs"
              />
              <Button
                variant={showFilters ? "brand" : "outline"}
                size="sm"
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Filters drawer */}
        <div className="container-app">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-6 rounded-2xl p-5 border space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Select
                    label="Make"
                    placeholder="All Makes"
                    options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                  />
                  <Select
                    label="Body Type"
                    placeholder="All Types"
                    options={VEHICLE_BODY_TYPES}
                    value={selectedBodyType}
                    onChange={(e) => setSelectedBodyType(e.target.value)}
                  />
                  <Select
                    label="Condition"
                    placeholder="Any"
                    options={VEHICLE_CONDITIONS}
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  />
                  <div className="flex gap-2 items-end">
                    <Input
                      label="Min Price"
                      type="number"
                      placeholder="$ Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      containerClassName="w-1/2"
                    />
                    <Input
                      label="Max Price"
                      type="number"
                      placeholder="$ Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      containerClassName="w-1/2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                  <Select
                    label="Fuel Type"
                    placeholder="Any"
                    options={VEHICLE_FUEL_TYPES}
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.target.value)}
                  />
                  <Select
                    label="Transmission"
                    placeholder="Any"
                    options={VEHICLE_TRANSMISSIONS}
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {isLoading ? 'Searching listings...' : `${filteredProducts.length} listings found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="🚗"
              title="No automotive listings found"
              description="Adjust your filters or clear them to start over."
              actionLabel="Clear Filters"
              onClick={clearAllFilters}
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
