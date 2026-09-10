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
} from 'lucide-react';
import ProductService from '@api/services/product.service';
import WantedNavTabs from '../components/WantedNavTabs';
import ProductCard from '@components/cards/ProductCard';
import WantedFilterModal from '../components/WantedFilterModal';
import Spinner from '@components/ui/Spinner';
import { cn } from '@lib/utils';
import { WANTED_CATEGORIES } from '../constants/wantedCategories';

export default function WantedHomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    selectedBudget !== 'all' ||
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
    if (selectedBudget !== 'all') {
      if (selectedBudget === 'under_100' && price > 100) return false;
      if (selectedBudget === '100_500' && (price < 100 || price > 500)) return false;
      if (selectedBudget === '500_1k' && (price < 500 || price > 1000)) return false;
      if (selectedBudget === '1k_5k' && (price < 1000 || price > 5000)) return false;
      if (selectedBudget === '5k_plus' && price < 5000) return false;
    }
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

      <div className="container-app py-2 sm:py-4 space-y-4 sm:space-y-5 pb-24 max-w-7xl mx-auto">
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
            onClick={() => navigate('/wanted/create')}
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

            {selectedBudget !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
                💵 Budget: {selectedBudget.replace('_', '-')}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedLocation('all');
                setSelectedBudget('all');
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
                    onClick={() => navigate('/wanted/create')}
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

        {/* Section: Available Seller Listings */}
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
                onClick={() => navigate('/wanted/create')}
                className="rounded-xl bg-[#5046e5] hover:bg-[#4338ca] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
              >
                Post Wanted Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
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
          budget: selectedBudget,
          condition: selectedCondition,
          sort: selectedSort,
        }}
        onApplyFilters={(newFilters) => {
          setSelectedLocation(newFilters.location);
          setSelectedBudget(newFilters.budget);
          setSelectedCondition(newFilters.condition);
          setSelectedSort(newFilters.sort);
        }}
      />
    </>
  );
}
