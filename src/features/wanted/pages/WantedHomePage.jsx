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
  ChevronDown,
  Target,
  ShoppingBag,
} from 'lucide-react';
import WantedService from '@api/services/wanted.service';
import WantedNavTabs from '../components/WantedNavTabs';
import WantedCard from '../components/WantedCard';
import IHaveThisModal from '../components/IHaveThisModal';
import WantedMatchesModal from '../components/WantedMatchesModal';
import WantedFilterModal from '../components/WantedFilterModal';
import Spinner from '@components/ui/Spinner';
import { cn } from '@lib/utils';
import { WANTED_CATEGORIES, PHILLY_NEIGHBORHOODS } from '../constants/wantedCategories';

// Sample fallback requests matching the design reference if database is empty
const INITIAL_SAMPLE_REQUESTS = [
  {
    id: 'sample-1',
    title: 'iPhone 15 Pro Max',
    category: 'electronics',
    budget_min: 800,
    budget_max: 1000,
    location_city: 'Philadelphia, PA',
    location_radius: 10,
    posted_ago: 'Posted 2h ago',
    views: 24,
    status: 'active',
    wanted_matches: [{}, {}, {}, {}, {}],
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=70'],
  },
  {
    id: 'sample-2',
    title: 'Toyota Camry 2021+',
    category: 'automotive',
    budget_min: 20000,
    budget_max: 25000,
    location_city: 'Philadelphia, PA',
    location_radius: 20,
    posted_ago: 'Posted 5h ago',
    views: 42,
    status: 'active',
    wanted_matches: [{}, {}, {}, {}, {}, {}, {}, {}],
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&auto=format&fit=crop&q=70'],
  },
  {
    id: 'sample-3',
    title: 'Sectional Sofa',
    category: 'home',
    budget_min: 300,
    budget_max: 600,
    location_neighborhood: 'Northeast Philadelphia',
    location_city: 'PA',
    location_radius: 15,
    posted_ago: 'Posted 1d ago',
    views: 67,
    status: 'active',
    wanted_matches: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=70'],
  },
  {
    id: 'sample-4',
    title: 'PS5 Console',
    category: 'electronics',
    budget_min: 350,
    budget_max: 600,
    location_city: 'Philadelphia, PA',
    location_radius: 10,
    posted_ago: 'Posted 1d ago',
    views: 53,
    status: 'active',
    wanted_matches: [{}, {}, {}, {}],
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=70'],
  },
  {
    id: 'sample-5',
    title: 'Dining Table for 6',
    category: 'home',
    budget_min: 200,
    budget_max: 500,
    location_neighborhood: 'South Philadelphia',
    location_city: 'PA',
    location_radius: 15,
    posted_ago: 'Posted 2d ago',
    views: 88,
    status: 'paused',
    wanted_matches: [],
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&auto=format&fit=crop&q=70'],
  },
];

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

  const [activeRequestForMatch, setActiveRequestForMatch] = useState(null);
  const [activeRequestForView, setActiveRequestForView] = useState(null);

  // Fetch Wanted requests
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['wanted-home-requests', selectedCategory, searchTerm, selectedSort],
    queryFn: () =>
      WantedService.browse({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sort: selectedSort,
        limit: 20,
      }),
  });

  const rawRequests = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData) ? responseData : []);

  const displayRequests = rawRequests.length > 0 ? rawRequests : INITIAL_SAMPLE_REQUESTS;

  // Filter client-side when using sample or category/location filters
  const filteredRequests = displayRequests.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm && !item.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedLocation !== 'all') {
      const locStr = `${item.location_neighborhood || ''} ${item.location_city || ''}`.toLowerCase();
      if (!locStr.includes(selectedLocation.toLowerCase())) return false;
    }
    if (selectedBudget !== 'all') {
      const maxB = item.budget_max || item.budget_min || 0;
      if (selectedBudget === 'under_100' && maxB > 100) return false;
      if (selectedBudget === '100_500' && (maxB < 100 || maxB > 500)) return false;
      if (selectedBudget === '500_1k' && (maxB < 500 || maxB > 1000)) return false;
      if (selectedBudget === '1k_5k' && (maxB < 1000 || maxB > 5000)) return false;
      if (selectedBudget === '5k_plus' && maxB < 5000) return false;
    }
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Wanted Requests — Aliwayz</title>
        <meta
          name="description"
          content="Tell Philadelphia what you're looking for. Local sellers and agents can respond to your wanted requests."
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
            Tell Philadelphia what you're looking for. Local sellers can respond.
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
              placeholder="Search wanted requests..."
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

        {/* Category Pills Row with Filter Trigger Button */}
        <div className="flex items-center gap-2">
          {/* Categories Horizontal Scroll */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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

          {/* Filter Modal Trigger Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            title="Open Filters"
            className={cn(
              'relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-2xl border transition-all shrink-0 shadow-sm',
              hasActiveFilters
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20'
                : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400 hover:text-[var(--color-text-primary)]'
            )}
          >
            <SlidersHorizontal size={17} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                !
              </span>
            )}
          </button>
        </div>

        {/* Hero Banner (Matching media_1789068793221.png) */}
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
                  Post a Wanted request and let local sellers find you.
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

            {/* Decorative Right Illustration Badges */}
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

        {/* Section: Active Wanted Requests */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Active Wanted Requests
            </h2>
            <Link
              to="/wanted/feed"
              className="text-xs sm:text-sm font-bold text-[#5046e5] hover:underline flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
              <Sparkles className="mx-auto mb-3 text-indigo-600" size={36} />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                No wanted requests found
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm mx-auto">
                Be the first to post what you're looking for in Philadelphia!
              </p>
              <button
                onClick={() => navigate('/wanted/create')}
                className="rounded-xl bg-[#5046e5] hover:bg-[#4338ca] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
              >
                Post Wanted Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <WantedCard
                  key={req.id}
                  request={req}
                  onIHaveThis={(item) => setActiveRequestForMatch(item)}
                  onViewMatches={(item) => setActiveRequestForView(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seller Action Modal (I Have This) */}
      <IHaveThisModal
        isOpen={!!activeRequestForMatch}
        onClose={() => setActiveRequestForMatch(null)}
        request={activeRequestForMatch}
      />

      {/* Buyer Matches View Modal */}
      <WantedMatchesModal
        isOpen={!!activeRequestForView}
        onClose={() => setActiveRequestForView(null)}
        request={activeRequestForView}
      />

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
