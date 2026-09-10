import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, MapPin, DollarSign, Check, RotateCcw } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { PHILLY_NEIGHBORHOODS, MARKETPLACE_CONDITIONS } from '../constants/wantedCategories';

const BUDGET_OPTIONS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'under_100', label: 'Under $100' },
  { id: '100_500', label: '$100 – $500' },
  { id: '500_1k', label: '$500 – $1,000' },
  { id: '1k_5k', label: '$1,000 – $5,000' },
  { id: '5k_plus', label: '$5,000+' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'matches', label: 'Most Matches' },
  { id: 'budget_high', label: 'Highest Budget' },
  { id: 'budget_low', label: 'Lowest Budget' },
];

export default function WantedFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) {
  const [localLocation, setLocalLocation] = useState(filters?.location || 'all');
  const [localBudget, setLocalBudget] = useState(filters?.budget || 'all');
  const [localCondition, setLocalCondition] = useState(filters?.condition || 'all');
  const [localSort, setLocalSort] = useState(filters?.sort || 'newest');
  const [localNearMe, setLocalNearMe] = useState(filters?.nearMe || false);

  useEffect(() => {
    if (isOpen) {
      setLocalLocation(filters?.location || 'all');
      setLocalBudget(filters?.budget || 'all');
      setLocalCondition(filters?.condition || 'all');
      setLocalSort(filters?.sort || 'newest');
      setLocalNearMe(filters?.nearMe || false);
    }
  }, [isOpen, filters]);

  const handleReset = () => {
    setLocalLocation('all');
    setLocalBudget('all');
    setLocalCondition('all');
    setLocalSort('newest');
    setLocalNearMe(false);
  };

  const handleApply = () => {
    onApplyFilters({
      location: localLocation,
      budget: localBudget,
      condition: localCondition,
      sort: localSort,
      nearMe: localNearMe,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-5 sm:p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Filter Wanted Requests
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Refine by location, budget, condition, and sort order.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Form */}
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={13} className="text-indigo-600" />
              <span>Location / Neighborhood</span>
            </label>
            <select
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Philadelphia & Surrounding Area</option>
              {PHILLY_NEIGHBORHOODS.map((nh) => (
                <option key={nh} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Budget Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={13} className="text-indigo-600" />
              <span>Budget Range</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((opt) => {
                const isSelected = localBudget === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLocalBudget(opt.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Condition */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Item Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MARKETPLACE_CONDITIONS.map((cond) => {
                const isSelected = localCondition === cond.id;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setLocalCondition(cond.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                    }`}
                  >
                    {cond.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sort By */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = localSort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLocalSort(opt.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Near Me Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3.5">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                Near My Location Only
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Filter requests within 10 miles of your current location
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocalNearMe(!localNearMe)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localNearMe ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localNearMe ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1.5 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all"
            >
              <Check size={16} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
