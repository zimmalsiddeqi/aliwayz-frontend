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
import { isSeller, cn } from '@lib/utils';
import {
  REAL_ESTATE_TYPES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  CATEGORY_IDS,
} from '@utils/constants';
import { getCategoryIdsForMain, parsePropertyDescription } from '@utils/categoryHelpers';
import useMediaQuery from '@hooks/useMediaQuery';

export default function PropertyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { lat, lng, isLocated, radiusMiles, city: locationCity, state: locationState } = useLocationStore();
  const canSell = isAuthenticated && isSeller(user?.role);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('all'); // all, sale, rent, lease, vacation
  const [selectedType, setSelectedType] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const propertyCategoryIds = getCategoryIdsForMain('property', allCategories);

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['property-products', sortBy, lat, lng, radiusMiles],
    queryFn: async ({ pageParam = 1 }) => {
      if (propertyCategoryIds.length > 0) {
        const results = await Promise.all(
          propertyCategoryIds.map((catId) =>
            ProductService.browse({
              category_id: catId,
              page: pageParam,
              limit: 50,
              sort: sortBy,
              ...locationParams,
            }).catch(() => ({ data: [], pagination: { total: 0 } }))
          )
        );
        const allProducts = results.flatMap((r) => r.data || []);
        const totalCount = results.reduce((s, r) => s + (r.pagination?.total || 0), 0);
        
        if (sortBy === 'price_asc') {
          allProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
          allProducts.sort((a, b) => b.price - a.price);
        } else {
          allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return {
          data: allProducts,
          pagination: {
            page: pageParam,
            limit: 50,
            total: totalCount,
            has_next: allProducts.length > 50,
          },
        };
      }
      return { data: [], pagination: { total: 0 } };
    },
    getNextPageParam: (last) => (last.pagination?.has_next ? last.pagination.page + 1 : undefined),
    enabled: propertyCategoryIds.length > 0,
  });

  const products = data?.pages.flatMap((p) => p.data) || [];

  // Local/client filters application
  const filteredProducts = products.filter((p) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description && p.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    const attrs = parsePropertyDescription(p.description);

    // Intent/Transaction Type Filter
    if (selectedIntent !== 'all' && attrs.intent !== selectedIntent) return false;

    // Property Type Filter
    if (selectedType && attrs.propertyType !== selectedType) return false;

    // Beds Filter
    if (beds) {
      if (beds === 'studio') {
        if (attrs.bedrooms !== 'studio') return false;
      } else {
        const prodBeds = parseInt(attrs.bedrooms, 10);
        const filterBeds = parseInt(beds, 10);
        if (isNaN(prodBeds) || prodBeds < filterBeds) return false;
      }
    }

    // Baths Filter
    if (baths) {
      const prodBaths = parseFloat(attrs.bathrooms);
      const filterBaths = parseFloat(baths);
      if (isNaN(prodBaths) || prodBaths < filterBaths) return false;
    }

    // Price Filter
    const price = Number(p.price);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;

    return true;
  });

  const displayLocation = [locationCity, locationState].filter(Boolean).join(', ') || 'Near me';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedIntent('all');
    setSelectedType('');
    setBeds('');
    setBaths('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <>
      <Helmet>
        <title>Real Estate — Aliwayz</title>
      </Helmet>
      <div className="pb-24 md:pb-10">
        {/* Simplified tall green header */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)' }}
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
                <Link to="/sell/create?category=real-estate">
                  <Button
                    size="xs"
                    leftIcon={<PlusCircle size={14} />}
                    className="!border-white/35 !bg-white/20 !text-white backdrop-blur-md hover:!bg-white/30"
                  >
                    List Property
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-2.5">
              <h1 className="text-xl font-bold text-white flex items-center gap-1.5 sm:text-2xl">
                🏠 Real Estate
              </h1>
              <p className="text-xs text-white/70">Find homes, land & commercial space near you</p>
            </div>

            {/* Combined Search City/ZIP Bar */}
            <div className="mt-4 max-w-xl relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, ZIP, neighborhood..."
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

            {/* Segment Toggle: Intent */}
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Listings' },
                { id: 'sale', label: 'For Sale' },
                { id: 'rent', label: 'For Rent' },
                { id: 'lease', label: 'Commercial Lease' },
                { id: 'vacation', label: 'Vacation Rental' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIntent(item.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border"
                  style={{
                    backgroundColor: selectedIntent === item.id ? 'white' : 'rgba(255,255,255,0.1)',
                    color: selectedIntent === item.id ? '#064E3B' : 'white',
                    borderColor: selectedIntent === item.id ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Controls Row */}
        <div className="container-app py-3">
          <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-1 text-sm font-semibold truncate text-[var(--color-text-primary)]">
              {/* Removed redundant location selector, keeping header one */}
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

        {/* Dynamic Filter Bottom Drawer/Sheet */}
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
                    label="Property type"
                    placeholder="All Types"
                    options={[
                      { value: 'single_family', label: 'Single-Family Home' },
                      { value: 'townhome', label: 'Townhouse' },
                      { value: 'condo', label: 'Condo / Co-op' },
                      { value: 'multi_family', label: 'Multi-Family' },
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'room', label: 'Room / Sublet' },
                      { value: 'land', label: 'Land / Lot' },
                      { value: 'commercial', label: 'Commercial' },
                      { value: 'office', label: 'Office' },
                      { value: 'industrial', label: 'Industrial / Warehouse' },
                      { value: 'vacation', label: 'Vacation rental' },
                    ]}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  />
                  <Select
                    label="Bedrooms"
                    placeholder="Any"
                    options={[
                      { value: 'studio', label: 'Studio' },
                      { value: '1', label: '1+ Bed' },
                      { value: '2', label: '2+ Bed' },
                      { value: '3', label: '3+ Bed' },
                      { value: '4', label: '4+ Bed' },
                    ]}
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                  />
                  <Select
                    label="Bathrooms"
                    placeholder="Any"
                    options={[
                      { value: '1', label: '1+ Bath' },
                      { value: '2', label: '2+ Bath' },
                      { value: '3', label: '3+ Bath' },
                    ]}
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
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

          {/* Results section */}
          <div className="mb-4">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {isLoading ? 'Searching properties...' : `${filteredProducts.length} properties matching criteria`}
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
              icon="🏠"
              title="No properties found"
              description="Try expanding your location or adjusting your filters to see more results."
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
