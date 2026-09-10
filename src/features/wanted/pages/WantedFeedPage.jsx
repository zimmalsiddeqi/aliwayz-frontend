import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  SlidersHorizontal,
  Home,
  Car,
  Smartphone,
  Shirt,
  Sofa,
  LayoutGrid,
  MapPin,
  Sparkles,
  ChevronDown,
  PlusCircle,
  Search,
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

export default function WantedFeedPage() {
  const navigate = useNavigate();
  // Default to 'all' categories
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [filterNearMe, setFilterNearMe] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    selectedBudget !== 'all' ||
    selectedCondition !== 'all' ||
    selectedSort !== 'newest' ||
    filterNearMe;

  const [activeRequestForMatch, setActiveRequestForMatch] = useState(null);
  const [activeRequestForView, setActiveRequestForView] = useState(null);

  // Real dynamic data from API
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['wanted-feed-requests', selectedCategory, selectedSort, filterNearMe, searchTerm, selectedLocation],
    queryFn: () =>
      WantedService.browse({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sort: selectedSort,
        city: selectedLocation === 'all' ? undefined : selectedLocation,
        limit: 30,
      }),
  });

  const rawRequests = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData) ? responseData : []);

  const filteredRequests = rawRequests.filter((item) => {
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
        <title>All Wanted Requests — Aliwayz</title>
        <meta
          name="description"
          content="Browse all buyer wanted requests in Philadelphia across electronics, vehicles, real estate, fashion, and home goods."
        />
      </Helmet>

      {/* Top 3-tab navigation bar */}
      <WantedNavTabs />

      <div className="container-app py-2 sm:py-4 space-y-4 pb-24 max-w-4xl mx-auto">
        {/* Header Title + Post Button */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
              Buyer Requests
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
              Browse all wanted items posted by buyers in Philadelphia.
            </p>
          </div>
          <button
            onClick={() => navigate('/wanted/create')}
            className="flex items-center gap-1.5 rounded-2xl bg-[#5046e5] hover:bg-[#4338ca] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 whitespace-nowrap transition-all"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Post Wanted</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wanted products and requests..."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--color-text-primary)] shadow-sm focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>

        {/* 1. FILTER CONTROLS ROW (STRICTLY ABOVE CATEGORIES) */}
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

            {filterNearMe && (
              <span className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-[11px] font-semibold whitespace-nowrap">
                📍 Near Me
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
                setFilterNearMe(false);
                setSearchTerm('');
              }}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 whitespace-nowrap transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* 2. CATEGORIES ROW (PLACED BENEATH FILTER CONTROLS) */}
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
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Requests Feed List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
            <Sparkles className="mx-auto mb-3 text-indigo-600" size={36} />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              No buyer requests found
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm mx-auto">
              Check back soon or try selecting a different category.
            </p>
            <button
              onClick={() => navigate('/wanted/create')}
              className="rounded-xl bg-[#5046e5] hover:bg-[#4338ca] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
            >
              Post Wanted Request
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
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
          nearMe: filterNearMe,
        }}
        onApplyFilters={(newFilters) => {
          setSelectedLocation(newFilters.location);
          setSelectedBudget(newFilters.budget);
          setSelectedCondition(newFilters.condition);
          setSelectedSort(newFilters.sort);
          setFilterNearMe(newFilters.nearMe);
        }}
      />
    </>
  );
}
