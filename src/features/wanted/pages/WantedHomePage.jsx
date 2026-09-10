import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  PlusCircle,
  Home,
  Car,
  Smartphone,
  Shirt,
  Sofa,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Target,
  ShoppingBag,
  MapPin,
  Clock,
  Eye,
  Heart,
  ChevronRight,
  ShieldCheck,
  Building2,
  Truck,
  Laptop,
} from 'lucide-react';
import ProductService from '@api/services/product.service';
import useAuthStore from '@store/auth.store';
import WantedNavTabs from '../components/WantedNavTabs';
import WantedFilterModal from '../components/WantedFilterModal';
import Spinner from '@components/ui/Spinner';
import { cn, formatPrice, formatRelativeTime, getConditionLabel } from '@lib/utils';
import { getPrimaryImage } from '@utils/helpers';
import { parsePropertyDescription } from '@utils/categoryHelpers';
import { WANTED_CATEGORIES } from '../constants/wantedCategories';

// Helper to render high quality category/item icon when no product image is present
function renderProductThumbnailIcon(category = '', title = '') {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  let IconComponent = ShoppingBag;
  let gradientClass = 'from-indigo-500 to-purple-600';

  if (cat.includes('auto') || cat.includes('vehicle') || t.includes('car') || t.includes('truck') || t.includes('sedan') || t.includes('suv')) {
    IconComponent = t.includes('truck') ? Truck : Car;
    gradientClass = 'from-emerald-500 to-teal-600';
  } else if (cat.includes('real') || cat.includes('prop') || t.includes('apartment') || t.includes('house') || t.includes('condo') || t.includes('rent')) {
    IconComponent = t.includes('apartment') || t.includes('building') ? Building2 : Home;
    gradientClass = 'from-violet-500 to-purple-600';
  } else if (cat.includes('elect') || t.includes('phone') || t.includes('laptop') || t.includes('macbook')) {
    IconComponent = t.includes('laptop') || t.includes('macbook') ? Laptop : Smartphone;
    gradientClass = 'from-blue-500 to-indigo-600';
  } else if (cat.includes('fashion') || t.includes('shirt') || t.includes('jacket') || t.includes('shoes')) {
    IconComponent = Shirt;
    gradientClass = 'from-rose-500 to-pink-600';
  } else if (cat.includes('home') || t.includes('sofa') || t.includes('table') || t.includes('chair')) {
    IconComponent = Sofa;
    gradientClass = 'from-amber-500 to-orange-600';
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-inner`}>
      <IconComponent size={22} className="drop-shadow-sm" />
    </div>
  );
}

// Product List View Card Component
function WantedProductListCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = getPrimaryImage(product?.product_images);
  const store = product?.stores;
  const seller = product?.users;
  const catName = (product?.category?.name || product?.category_name || '').toLowerCase();
  const desc = product?.description || '';
  const title = product?.title || 'Listed Item';

  const isRealEstate =
    catName.includes('real') ||
    catName.includes('prop') ||
    catName.includes('housing') ||
    desc.includes('[Property_Type]') ||
    desc.includes('Listing: For Rent') ||
    desc.includes('Listing: For Lease');

  const isAutomotive =
    catName.includes('vehicle') ||
    catName.includes('auto') ||
    catName.includes('car') ||
    /Mileage:\s*[^\n]+/i.test(desc);

  // Format Price
  let priceDisplay = formatPrice(product?.price, product?.currency);
  if (isRealEstate) {
    const descLower = desc.toLowerCase();
    if (descLower.includes('for rent') || descLower.includes('listing: for rent')) {
      priceDisplay += ' / mo';
    } else if (descLower.includes('for lease')) {
      priceDisplay += ' / mo';
    }
  }

  // Determine Badge Text
  let badgeText = getConditionLabel(product?.condition) || 'Available';
  let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  if (isRealEstate) {
    const descLower = desc.toLowerCase();
    if (descLower.includes('for rent')) {
      badgeText = 'For Rent';
      badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    } else if (descLower.includes('for lease')) {
      badgeText = 'For Lease';
      badgeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    } else {
      badgeText = 'For Sale';
      badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  } else if (isAutomotive) {
    const mileageMatch = desc.match(/Mileage:\s*([^\n\r]+)/i);
    if (mileageMatch) {
      badgeText = `${badgeText} • ${mileageMatch[1].trim()}`;
    }
  }

  const locationDisplay = product?.location_city || 'Philadelphia, PA';
  const timeAgoText = formatRelativeTime(product?.created_at) || 'Recently';

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between gap-3 sm:gap-4 cursor-pointer"
    >
      {/* Left: Compact Thumbnail & Main Details */}
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
        {/* Compact Thumbnail Image/Icon */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70 shadow-sm flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            renderProductThumbnailIcon(catName, title)
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold border',
                badgeColor
              )}
            >
              <span className="h-1.2 w-1.2 rounded-full bg-current" />
              {badgeText}
            </span>
            {product?.category?.name && (
              <span className="text-[9px] sm:text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-1.5 py-0.2 rounded-md">
                {product.category.name}
              </span>
            )}
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-[var(--color-text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {priceDisplay}
          </p>

          <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0 text-gray-400" />
              <span className="truncate">{locationDisplay}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={10} />
              {timeAgoText}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Seller info & View Details CTA */}
      <div className="flex flex-col items-end justify-center gap-1 sm:gap-1.5 shrink-0">
        {store ? (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] font-medium">
            <span className="truncate max-w-[100px]">{store.store_name}</span>
            {store.is_verified && <ShieldCheck size={13} className="text-blue-500 shrink-0" />}
          </div>
        ) : seller ? (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] font-medium">
            <span className="truncate max-w-[100px]">
              {seller.full_name || seller.username || 'Verified Seller'}
            </span>
          </div>
        ) : null}

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="flex items-center gap-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
        >
          <span className="hidden xs:inline">View</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function WantedHomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handlePostWantedClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wanted/create');
    } else {
      navigate('/wanted/create');
    }
  };

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    selectedCondition !== 'all' ||
    selectedSort !== 'newest';

  // Fetch real seller-listed items from the backend across Marketplace, Automotive, and Real Estate
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['wanted-home-seller-listings', selectedCategory, searchTerm, selectedSort, selectedLocation],
    queryFn: () =>
      ProductService.browse({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sort: selectedSort,
        city: selectedLocation === 'all' ? undefined : selectedLocation,
        limit: 30,
      }),
  });

  const rawProducts = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData) ? responseData : []);

  // Filter client-side if budget is set
  const filteredProducts = rawProducts.filter((prod) => {
    const price = Number(prod.price || 0);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    if (selectedCondition !== 'all' && prod.condition && prod.condition !== selectedCondition) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Wanted & Matching Marketplace Items — Aliwayz</title>
        <meta
          name="description"
          content="Browse local seller listings and matching marketplace items in Philadelphia, or post a wanted request to let sellers find you."
        />
      </Helmet>

      {/* Top 3-tab navigation bar */}
      <WantedNavTabs />

      <div className="container-app py-2 sm:py-4 space-y-4 sm:space-y-5 pb-24 max-w-4xl mx-auto">
        {/* Header Title Section */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Wanted
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Explore items listed by local sellers or post what you're looking for.
          </p>
        </div>

        {/* Search Bar + Post Wanted Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search available seller listings and items..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[var(--color-text-primary)] shadow-sm focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={handlePostWantedClick}
            className="flex items-center gap-1.5 rounded-2xl bg-[#5046e5] hover:bg-[#4338ca] text-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 whitespace-nowrap transition-all transform active:scale-95"
          >
            <PlusCircle size={17} />
            <span>Post Wanted</span>
          </button>
        </div>

        {/* 1. FILTER CONTROLS BAR (STRICTLY ABOVE CATEGORIES) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all border shadow-sm',
                hasActiveFilters
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:border-gray-400'
              )}
            >
              <SlidersHorizontal size={14} />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
                📍 {selectedLocation}
              </span>
            )}

            {(minPrice !== '' || maxPrice !== '') && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
                💵 Budget: {minPrice ? `$${minPrice}` : '$0'} – {maxPrice ? `$${maxPrice}` : 'Any'}
              </span>
            )}

            {selectedCondition !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
                ✨ {selectedCondition}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedLocation('all');
                setMinPrice('');
                setMaxPrice('');
                setSelectedCondition('all');
                setSelectedSort('newest');
                setSearchTerm('');
              }}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 whitespace-nowrap transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* 2. CATEGORIES ROW (PLACED CLEANLY BENEATH FILTER CONTROLS) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {WANTED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon =
              cat.id === 'electronics'
                ? Smartphone
                : cat.id === 'automotive'
                ? Car
                : cat.id === 'real_estate'
                ? Home
                : cat.id === 'fashion'
                ? Shirt
                : cat.id === 'home'
                ? Sofa
                : LayoutGrid;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border shrink-0',
                  isSelected
                    ? 'bg-[#5046e5] text-white border-[#5046e5] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30 border border-indigo-100/80 dark:border-indigo-900/40 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-[#5046e5] dark:text-indigo-300 shadow-sm">
                <Target size={26} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  Can't find what you're looking for?
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Post a Wanted request and let local sellers find you with their matching inventory.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handlePostWantedClick}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#5046e5] hover:bg-[#4338ca] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all transform active:scale-95"
                  >
                    <span>Post a Wanted Request</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Right Badges */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 pr-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-blue-600">
                <Car size={18} />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-purple-600">
                <Smartphone size={18} />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-emerald-600">
                <ShoppingBag size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Available Seller Listings in List View */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Seller Listings on Aliwayz
            </h2>
            <Link
              to="/wanted/feed"
              className="text-xs sm:text-sm font-bold text-[#5046e5] hover:underline flex items-center gap-1"
            >
              <span>Browse Buyer Requests</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
              <Sparkles className="mx-auto mb-3 text-indigo-600" size={36} />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                No matching seller listings found
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm mx-auto">
                Can't find what you need? Post a Wanted request and local sellers will find you!
              </p>
              <button
                onClick={handlePostWantedClick}
                className="rounded-xl bg-[#5046e5] hover:bg-[#4338ca] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
              >
                Post Wanted Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((prod) => (
                <WantedProductListCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <WantedFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{
          location: selectedLocation,
          minPrice,
          maxPrice,
          condition: selectedCondition,
          sort: selectedSort,
        }}
        onApplyFilters={(newFilters) => {
          setSelectedLocation(newFilters.location);
          setMinPrice(newFilters.minPrice || '');
          setMaxPrice(newFilters.maxPrice || '');
          setSelectedCondition(newFilters.condition);
          setSelectedSort(newFilters.sort);
        }}
      />
    </>
  );
}
