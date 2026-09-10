import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, MapPin, DollarSign, Check, RotateCcw, Sparkles } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { PHILLY_NEIGHBORHOODS } from '../constants/wantedCategories';

// Smart Universal Condition / Listing Status Options
const STATUS_OPTIONS = [
  { id: 'all', label: 'Any Status / Condition' },
  { id: 'new', label: 'Brand New / New Construction' },
  { id: 'like_new', label: 'Like New / Move-in Ready / Certified' },
  { id: 'used', label: 'Gently Used / Pre-Owned' },
  { id: 'rent', label: 'For Rent / Lease' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'matches', label: 'Most Matches' },
];

export default function WantedFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) {
  const [localLocation, setLocalLocation] = useState(filters?.location || 'all');
  const [minPrice, setMinPrice] = useState(filters?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters?.maxPrice || '');
  const [localCondition, setLocalCondition] = useState(filters?.condition || 'all');
  const [localSort, setLocalSort] = useState(filters?.sort || 'newest');

  useEffect(() => {
    if (isOpen) {
      setLocalLocation(filters?.location || 'all');
      setMinPrice(filters?.minPrice || '');
      setMaxPrice(filters?.maxPrice || '');
      setLocalCondition(filters?.condition || 'all');
      setLocalSort(filters?.sort || 'newest');
    }
  }, [isOpen, filters]);

  const handleReset = () => {
    setLocalLocation('all');
    setMinPrice('');
    setMaxPrice('');
    setLocalCondition('all');
    setLocalSort('newest');
  };

  const handleApply = () => {
    onApplyFilters({
      location: localLocation,
      minPrice,
      maxPrice,
      condition: localCondition,
      sort: localSort,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showClose={false}>
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
        {/* Single Clean Modal Header with only ONE close button */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-sm">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                Filters
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)]">
                Customize location, budget, condition, and sorting.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters Body */}
        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-0.5">
          {/* 1. Location Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <MapPin size={13} className="text-indigo-600" />
              <span>Location / Neighborhood</span>
            </label>
            <select
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Philadelphia & Metro Area</option>
              {PHILLY_NEIGHBORHOODS.map((nh) => (
                <option key={nh} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Custom Budget Range (Min & Max only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <DollarSign size={13} className="text-indigo-600" />
              <span>Budget Range ($)</span>
            </label>

            {/* Clean Min/Max Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-7 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] pl-7 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Condition & Listing Status (Universal Strategy) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-600" />
              <span>Condition & Listing Type</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = localCondition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLocalCondition(opt.id)}
                    className={`rounded-2xl border p-2 text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sort Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-primary)]">
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
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition-all text-center ${
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
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1.5 transition-colors"
          >
            <RotateCcw size={13} />
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
              <Check size={15} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
