import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { PlusCircle, Bookmark, CheckCircle2, PauseCircle, Trash2, Home, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import WantedService from '@api/services/wanted.service';
import useAuthStore from '@store/auth.store';
import WantedNavTabs from '../components/WantedNavTabs';
import WantedMatchesModal from '../components/WantedMatchesModal';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import { cn } from '@lib/utils';
import toast from '@lib/toast';

export default function MyWantedRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'matches' | 'responses' | 'fulfilled'
  const [selectedRequestForMatches, setSelectedRequestForMatches] = useState(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['my-wanted-requests', activeTab],
    queryFn: () => WantedService.getMyRequests({ status: activeTab === 'active' ? 'active' : undefined }),
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => WantedService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Request updated');
      queryClient.invalidateQueries({ queryKey: ['my-wanted-requests'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update request');
    },
  });

  const list = Array.isArray(requests?.data) ? requests.data : (Array.isArray(requests) ? requests : []);

  // Filter list by tab if needed
  const filteredList = list.filter((item) => {
    if (activeTab === 'active') return item.status === 'active';
    if (activeTab === 'matches') return (item.wanted_matches?.length || 0) > 0;
    if (activeTab === 'responses') return (item.wanted_matches?.length || 0) > 0;
    if (activeTab === 'fulfilled') return item.status === 'fulfilled';
    return true;
  });

  const handlePostWantedClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wanted/create');
    } else {
      navigate('/wanted/create');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Wanted Requests — Aliwayz</title>
      </Helmet>

      <WantedNavTabs />

      <div className="container-app py-4 sm:py-6 space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
              My Requests
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
              Manage your active requests and review incoming seller proposals.
            </p>
          </div>

          <button
            onClick={handlePostWantedClick}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle size={15} />
            <span>New Request</span>
          </button>
        </div>

        {/* Filter Tabs (Screen 8 Reference) */}
        <div className="flex rounded-2xl bg-[var(--color-bg-secondary)] p-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'active', label: 'Active' },
            { id: 'matches', label: 'Matches' },
            { id: 'responses', label: 'Responses' },
            { id: 'fulfilled', label: 'Fulfilled' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 min-w-[70px] py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap',
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
            <Bookmark className="mx-auto mb-3 text-[var(--color-text-muted)]" size={36} />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              No {activeTab} requests
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-4">
              Post what you want to buy or rent and let local sellers propose matches.
            </p>
            <button
              onClick={handlePostWantedClick}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all"
            >
              Post a Request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((req) => {
              const matchesCount = req.wanted_matches?.length || 0;
              const intentStr = req.intent === 'rent' ? 'Rent' : req.intent === 'lease' ? 'Lease' : 'Buy';

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForMatches(req)}
                  className="group cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 shadow-sm transition-all hover:border-blue-600/40 hover:shadow-md flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                          req.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', req.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                        {req.status?.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)] truncate">
                        {req.title}
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {intentStr} • ${Number(req.budget_min).toLocaleString()} - ${Number(req.budget_max).toLocaleString()}
                    </p>

                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {req.location_city} • {req.bedrooms || 'Any'} beds • {req.bathrooms || 'Any'} baths • {req.property_size || ''}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles size={12} />
                        {matchesCount} {matchesCount === 1 ? 'match' : 'matches'}
                      </span>
                      <span className="text-[var(--color-text-muted)]">•</span>
                      <span className="text-[var(--color-text-muted)]">
                        {matchesCount} responses
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatusMutation.mutate({
                          id: req.id,
                          status: req.status === 'active' ? 'paused' : 'active',
                        });
                      }}
                      className="rounded-xl border border-[var(--color-border)] p-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                      title={req.status === 'active' ? 'Pause Request' : 'Resume Request'}
                    >
                      <PauseCircle size={16} />
                    </button>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WantedMatchesModal
        isOpen={!!selectedRequestForMatches}
        onClose={() => setSelectedRequestForMatches(null)}
        request={selectedRequestForMatches}
      />
    </>
  );
}
