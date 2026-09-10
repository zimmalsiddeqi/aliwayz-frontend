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
} from 'lucide-react';
import WantedService from '@api/services/wanted.service';
import WantedNavTabs from '../components/WantedNavTabs';
import WantedCard from '../components/WantedCard';
import IHaveThisModal from '../components/IHaveThisModal';
import WantedMatchesModal from '../components/WantedMatchesModal';
import Spinner from '@components/ui/Spinner';
import { cn } from '@lib/utils';
import { WANTED_CATEGORIES } from '../constants/wantedCategories';

export default function WantedHomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRequestForMatch, setActiveRequestForMatch] = useState(null);
  const [activeRequestForView, setActiveRequestForView] = useState(null);

  // Fetch Wanted requests
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['wanted-home-requests', selectedCategory, searchTerm],
    queryFn: () =>
      WantedService.browse({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        limit: 20,
      }),
  });

  const requests = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData) ? responseData : []);

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

      <div className="container-app py-2 sm:py-4 space-y-5 pb-20">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
              <span>Wanted</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
              Tell Philadelphia what you're looking for. Local sellers can respond.
            </p>
          </div>
        </div>

        {/* Search Bar + Post Wanted Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wanted requests..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[var(--color-text-primary)] shadow-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigate('/wanted/create')}
            className="flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 whitespace-nowrap transition-all"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Post Wanted</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {WANTED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon =
              cat.id === 'real_estate'
                ? Home
                : cat.id === 'automotive'
                ? Car
                : cat.id === 'electronics'
                ? Smartphone
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
                  'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                )}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Banner (Screen 1 Reference) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 sm:p-6 text-white shadow-lg shadow-blue-500/15">
          <div className="relative z-10 max-w-lg space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Home size={22} className="text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-black leading-tight">
              Looking for a home or specific item?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Post a wanted request and let verified local agents, owners, and sellers find you with their matching inventory.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/wanted/create')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-bold text-blue-600 shadow-md hover:bg-blue-50 transition-all transform active:scale-95"
              >
                <span>Post a Request</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Subtle decorative circles */}
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-10 top-0 h-32 w-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />
        </div>

        {/* Active Requests Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Active Requests
            </h2>
            <Link
              to="/wanted/feed"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
              <Sparkles className="mx-auto mb-3 text-blue-600 dark:text-blue-400" size={36} />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                No wanted requests found
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm mx-auto">
                Be the first to post what you're looking for in Philadelphia!
              </p>
              <button
                onClick={() => navigate('/wanted/create')}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all"
              >
                Post Wanted Request
              </button>
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
    </>
  );
}
