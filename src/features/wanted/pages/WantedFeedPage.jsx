import { useState } from 'react';
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
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';
import WantedService from '@api/services/wanted.service';
import WantedNavTabs from '../components/WantedNavTabs';
import WantedCard from '../components/WantedCard';
import IHaveThisModal from '../components/IHaveThisModal';
import WantedMatchesModal from '../components/WantedMatchesModal';
import Spinner from '@components/ui/Spinner';
import { cn } from '@lib/utils';
import { WANTED_CATEGORIES } from '../constants/wantedCategories';

export default function WantedFeedPage() {
  const [selectedCategory, setSelectedCategory] = useState('real_estate');
  const [selectedSort, setSelectedSort] = useState('newest'); // 'newest' | 'budget_high' | 'budget_low'
  const [filterNearMe, setFilterNearMe] = useState(false);
  const [activeRequestForMatch, setActiveRequestForMatch] = useState(null);
  const [activeRequestForView, setActiveRequestForView] = useState(null);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['wanted-feed-requests', selectedCategory, selectedSort, filterNearMe],
    queryFn: () =>
      WantedService.browse({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sort: selectedSort,
        limit: 30,
      }),
  });

  const requests = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData) ? responseData : []);

  return (
    <>
      <Helmet>
        <title>Buyer Requests & Wanted Items — Aliwayz</title>
      </Helmet>

      <WantedNavTabs />

      <div className="container-app py-3 sm:py-5 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
              <span>Buyer Requests</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
              Browse buyer requests and match with your active listings or new properties.
            </p>
          </div>
        </div>

        {/* Filter Pills / Action Bar (Screen 9 Reference) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Category Selector */}
          {WANTED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap border',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Near Me Toggle */}
          <button
            onClick={() => setFilterNearMe(!filterNearMe)}
            className={cn(
              'flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap border',
              filterNearMe
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]'
            )}
          >
            <MapPin size={13} />
            <span>Near Me</span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="budget_high">Highest Budget</option>
            <option value="budget_low">Lowest Budget</option>
          </select>
        </div>

        {/* Requests Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
            <Sparkles className="mx-auto mb-3 text-blue-600" size={36} />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              No buyer requests found in this category
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Check back soon or browse other categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
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

      <WantedMatchesModal
        isOpen={!!activeRequestForView}
        onClose={() => setActiveRequestForView(null)}
        request={activeRequestForView}
      />
    </>
  );
}
