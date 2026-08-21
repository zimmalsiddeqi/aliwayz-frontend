import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import useAuthStore from '@store/auth.store';
import useLocationStore from '@store/location.store';
import SearchBar from '@components/common/SearchBar';
import { isSeller, cn } from '@lib/utils';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import useMediaQuery from '@hooks/useMediaQuery';
import { ITEM_CONDITIONS, SORT_OPTIONS, DEFAULT_PAGE_SIZE } from '@utils/constants';
import SearchCategoriesModal from '../components/SearchCategoriesModal';

const CATEGORY_ICONS = {
  Electronics: '📱',
  Vehicles: '🚗',
  Fashion: '👗',
  'Home & Furniture': '🛋️',
  Shoes: '👟',
  'Beauty & Personal Care': '💄',
  'Baby & Kids': '👶',
  'Sports & Outdoors': '⚽',
  'Toys & Games': '🧸',
  'Computers & Office': '💻',
  'Auto Parts & Accessories': '⚙️',
  'Jewelry & Watches': '⌚',
  'Books, Movies & Music': '📚',
  Appliances: '📺',
  'Tools & Equipment': '🔧',
  'Garden & Outdoor': '🏡',
  'Pet Supplies': '🐾',
  'Musical Instruments': '🎸',
  'Hobbies & Crafts': '🎨',
  'Collectibles & Memorabilia': '🏆',
  Handmade: '🤝',
  'Antiques & Vintage': '🏺',
  'Business & Commercial': '💼',
  'Real Estate': '🏢',
  'Free & Giveaway': '🎁',
  Other: '📦',
};

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const CATEGORIES = [
  {
    id:          'essentials',
    name:        'Marketplace',
    emoji:       '🛒',
    description: 'Electronics, fashion, home goods & more',
    gradient:    'linear-gradient(135deg, #4C1D95 0%, #7C3AED 60%, #A78BFA 100%)',
    glow:        'rgba(124,58,237,0.35)',
    path:        '/essentials',
    sellPath:    '/sell/create?category=essentials',
    bgPattern:   '📱👟🛋️📚🎮',
    stats:       ['Electronics', 'Fashion', 'Home'],
  },
  {
    id:          'vehicles',
    name:        'Automotive',
    emoji:       '🚗',
    description: 'Cars, trucks, motorcycles & powersports',
    gradient:    'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 60%, #60A5FA 100%)',
    glow:        'rgba(59,130,246,0.35)',
    path:        '/vehicles',
    sellPath:    '/sell/create?category=vehicles',
    bgPattern:   '🚗🏎️🚙🛻🏍️',
    stats:       ['Cars & Trucks', 'Motorcycles', 'Parts'],
  },
  {
    id:          'real-estate',
    name:        'Real Estate',
    emoji:       '🏠',
    description: 'Homes, apartments, land & commercial spaces',
    gradient:    'linear-gradient(135deg, #065F46 0%, #10B981 60%, #34D399 100%)',
    glow:        'rgba(16,185,129,0.35)',
    path:        '/real-estate',
    sellPath:    '/sell/create?category=real-estate',
    bgPattern:   '🏠🏢🏡🏗️🌍',
    stats:       ['For Sale', 'For Rent', 'Land'],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const sellerOnly = isAuthenticated && isSeller(user?.role);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchCategoriesOpen, setSearchCategoriesOpen] = useState(false);
  const { lat, lng, isLocated, radiusMiles } = useLocationStore();

  const filters = {
    category_id: searchParams.get('category_id') || undefined,
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    condition: searchParams.get('condition') || undefined,
    sort: searchParams.get('sort') || 'newest',
  };

  const locationParams =
    isLocated && lat && lng && radiusMiles !== 9999
      ? { lat, lng, radius_km: radiusMiles * 1.60934 }
      : {};

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== 'newest').length;

  const { data: allCategories = [] } = useQuery({
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

  const clearFilters = () => {
    const params = new URLSearchParams();
    setSearchParams(params);
  };

  const handleCategorySelect = (cat) => {
    updateFilter('category_id', cat.id);
    setSearchCategoriesOpen(false);
  };

  const quickCategories = useMemo(() => {
    const PREFERRED_ORDER = [
      'electronics',
      'vehicles',
      'fashion',
      'home-furniture',
      'shoes',
      'beauty-personal-care',
      'baby-kids',
      'sports-outdoors',
      'toys-games',
      'computers-office',
      'auto-parts-accessories',
      'jewelry-watches',
      'books-movies-music',
      'appliances',
      'tools-equipment',
      'garden-outdoor',
      'pet-supplies',
      'musical-instruments',
      'hobbies-crafts',
      'collectibles-memorabilia',
      'handmade',
      'antiques-vintage',
      'business-commercial',
      'real-estate',
      'free-giveaway',
      'other',
    ];
    const rootCats = allCategories.filter((c) => !c.parent_id);
    return [...rootCats].sort((a, b) => {
      const ai = PREFERRED_ORDER.indexOf(a.slug);
      const bi = PREFERRED_ORDER.indexOf(b.slug);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [allCategories]);

  return (
    <>
      <Helmet>
        <title>Aliwayz — Local Marketplace</title>
        <meta name="description" content="Buy and sell vehicles, real estate, and everyday items locally." />
      </Helmet>

      <div className="min-h-screen pb-24 md:pb-10">
        {/* ═══ SEARCH BAR ══════════════════════════════════ */}
        <section className="container-app pt-4 pb-2 sm:pt-6 sm:pb-3">
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </section>

        {/* ═══ 3 MAIN CATEGORIES ══════════════════════════ */}
        <section className="container-app py-4 sm:py-6">
          <motion.div
            className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                sellerOnly={sellerOnly}
                onNavigate={(path) => navigate(path)}
              />
            ))}
          </motion.div>
        </section>

        <section className="container-app py-2">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">
                  {isLocated ? '📍 Near You' : '✨ Recently Listed'}
                </h2>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<SlidersHorizontal size={14} />}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={cn(
                    "relative shrink-0 rounded-2xl h-[46px] border",
                    filtersOpen ? "bg-[var(--glass-bg-strong)] border-[var(--color-border)]" : "border-[var(--color-border)]"
                  )}
                >
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand)] text-[9px] font-bold text-white shadow-sm">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Inline Categories */}
              <div className="flex items-center justify-start gap-1.5 sm:gap-2 mb-6 overflow-x-auto pb-2 flex-nowrap w-full scrollbar-none">
                 <button
                   onClick={() => updateFilter('category_id', undefined)}
                   className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all"
                   style={{
                     backgroundColor: !filters.category_id ? '#7C3AED' : 'var(--color-surface)',
                     color: !filters.category_id ? 'white' : 'var(--color-text-secondary)',
                     border: `1px solid ${!filters.category_id ? '#7C3AED' : 'var(--color-border)'}`,
                   }}
                 >
                   <span className="text-[12px] sm:text-sm">🌟</span> All
                 </button>
                 {quickCategories.map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => updateFilter('category_id', cat.id)}
                     className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all"
                     style={{
                       backgroundColor: filters.category_id === cat.id ? '#7C3AED' : 'var(--color-surface)',
                       color: filters.category_id === cat.id ? 'white' : 'var(--color-text-secondary)',
                       border: `1px solid ${filters.category_id === cat.id ? '#7C3AED' : 'var(--color-border)'}`,
                     }}
                   >
                     <span className="text-[12px] sm:text-sm">{CATEGORY_ICONS[cat.name] || '📦'}</span> {cat.name}
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

              <div>
                 {isLoading ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                     {Array.from({ length: 8 }).map((_, i) => (
                       <ProductCardSkeleton key={i} />
                     ))}
                   </div>
                 ) : products.length === 0 ? (
                   <EmptyState
                     icon="🔍"
                     title="No products found"
                     description="Try adjusting your filters or search terms"
                     actionLabel="Clear Filters"
                     onAction={clearFilters}
                   />
                 ) : (
                   <>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
            
            <AnimatePresence>
              {filtersOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0, scale: 0.95 }}
                  animate={{ width: 280, opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block shrink-0 overflow-hidden"
                >
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 w-[280px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Filters</h3>
                      <button onClick={() => setFiltersOpen(false)} className="p-1 rounded-full hover:bg-[var(--glass-bg-strong)]">
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">

                      <div className="space-y-1">
                        <label className="text-xs font-medium">Price Range</label>
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Min" value={filters.min_price || ''} onChange={(e) => updateFilter('min_price', e.target.value)} className="text-center text-xs py-1.5" />
                          <span className="flex items-center text-xs text-[var(--color-text-muted)]">—</span>
                          <Input type="number" placeholder="Max" value={filters.max_price || ''} onChange={(e) => updateFilter('max_price', e.target.value)} className="text-center text-xs py-1.5" />
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
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs font-medium text-[var(--color-error)] w-full text-left mt-2">Clear all filters</button>
                      )}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

          </div>
        </section>
      </div>

      <AnimatePresence>
        {filtersOpen && isMobile && (
           <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
              />
              <motion.aside
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl p-6 bg-[var(--color-surface)] shadow-[var(--shadow-xl)]"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                 <div className="flex items-center justify-between mb-5">
                   <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                     Filters
                   </h3>
                   <div className="flex items-center gap-2">
                     {activeFilterCount > 0 && (
                       <button
                         onClick={clearFilters}
                         className="text-sm font-medium"
                         style={{ color: 'var(--color-error)' }}
                       >
                         Clear all
                       </button>
                     )}
                     <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-[var(--glass-bg-strong)] transition-colors">
                       <X size={20} style={{ color: 'var(--color-text-muted)' }} />
                     </button>
                   </div>
                 </div>
                 
                 <div className="space-y-5">
                   <Select
                     label="Category"
                     placeholder="All Categories"
                     value={filters.category_id || ''}
                     onChange={(e) => updateFilter('category_id', e.target.value)}
                     options={allCategories.map((c) => ({ value: c.id, label: c.name }))}
                   />
                   <div className="space-y-1.5">
                     <label className="text-sm font-medium">Price Range</label>
                     <div className="flex gap-2">
                       <Input
                         type="number"
                         placeholder="Min"
                         value={filters.min_price || ''}
                         onChange={(e) => updateFilter('min_price', e.target.value)}
                         className="text-center"
                       />
                       <span className="flex items-center text-[var(--color-text-muted)]">—</span>
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
                   <Button fullWidth onClick={() => setFiltersOpen(false)} className="mt-4">
                     Show Results
                   </Button>
                 </div>
              </motion.aside>
           </>
        )}
      </AnimatePresence>

      <SearchCategoriesModal
        isOpen={searchCategoriesOpen}
        onClose={() => setSearchCategoriesOpen(false)}
        categories={allCategories}
        onSelect={handleCategorySelect}
      />
    </>
  );
}

function CategoryCard({ cat, sellerOnly, onNavigate }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className="h-full"
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-[24px] cursor-pointer group flex flex-col justify-between h-24 sm:h-36"
        style={{
          background: cat.gradient,
          boxShadow: `0 8px 32px ${cat.glow}`,
        }}
        whileHover={{ y: -4, boxShadow: `0 12px 40px ${cat.glow}` }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate(cat.path)}
      >
        <div className="absolute inset-0 flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 opacity-[0.06] text-xl sm:text-2xl pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="select-none hidden sm:inline">
              {cat.bgPattern.split('').filter((c) => c.trim())[i % 5]}
            </span>
          ))}
        </div>

        <div className="absolute -top-12 -right-12 w-24 sm:w-36 h-24 sm:h-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-white/5" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-2 sm:p-3">
          <motion.div
            className="text-4xl sm:text-5xl mb-2"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {cat.emoji}
          </motion.div>
          <h2 className="text-[14px] sm:text-[18px] font-bold text-white w-full leading-tight truncate px-1">
            {cat.name}
          </h2>
        </div>
      </motion.div>
    </motion.div>
  );
}