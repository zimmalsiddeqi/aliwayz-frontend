import { useState } from 'react';
import {
  Smartphone,
  Shirt,
  Sofa,
  Package,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn } from '@lib/utils';
import Button from '@components/ui/Button';
import WizardProgressBar from './WizardProgressBar';
import {
  MARKETPLACE_CONDITIONS,
  DURATION_OPTIONS,
} from '../../constants/wantedCategories';

export default function MarketplaceWizard({
  category = 'marketplace',
  onSubmit,
  isSubmitting,
  onBackToCategory,
}) {
  const [step, setStep] = useState(1);

  // Form State - empty defaults with clean placeholders
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('any');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationRadius, setLocationRadius] = useState(15);
  const [durationDays, setDurationDays] = useState(30);

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError('Please enter an item name');
      setStep(1);
      return;
    }

    const payload = {
      category,
      title: title.trim(),
      intent: 'buy',
      item_type: brand || 'General',
      budget_min: Number(budgetMin) || 0,
      budget_max: Number(budgetMax) || 0,
      description: `Brand: ${brand || 'Any'}. Condition: ${condition || 'Any'}.\n\n${description}`,
      features: [condition ? `Condition: ${condition}` : 'Any condition', brand ? `Brand: ${brand}` : ''],
      location_city: locationCity || 'Philadelphia, PA',
      location_radius: Number(locationRadius) || 15,
      duration_days: Number(durationDays) || 30,
      metadata: {
        brand,
        condition,
      },
    };

    onSubmit(payload);
  };

  // STEP 1: Item & Condition
  if (step === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={1} steps={['Item', 'Details', 'Location', 'Review']} />

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <Package size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            What item are you looking for?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Specify the product title, brand, and acceptable condition.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              Item Name / Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              placeholder="e.g. Sony WH-1000XM5, iPhone 15 Pro, Herman Miller Chair"
              className={cn(
                "w-full rounded-xl border bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none transition-all",
                titleError
                  ? "border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-[var(--color-border)] focus:border-emerald-600"
              )}
            />
            {titleError && (
              <p className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1">
                ⚠️ {titleError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              Brand / Manufacturer (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Sony, Nike, Samsung, Herman Miller"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Preferred Condition
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MARKETPLACE_CONDITIONS.map((cond) => {
                const isSelected = condition === cond.id;
                return (
                  <div
                    key={cond.id}
                    onClick={() => setCondition(cond.id)}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 p-3 text-center transition-all',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-gray-400'
                    )}
                  >
                    <span className="text-xs">{cond.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation: Back and Next only */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBackToCategory}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                setTitleError('Please enter an item name');
                return;
              }
              setStep(2);
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Budget & Description
  if (step === 2) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={2} steps={['Item', 'Details', 'Location', 'Review']} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Budget & Details
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            How much are you willing to spend for this item?
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Budget Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Min Price ($)</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-xs text-[var(--color-text-muted)] mb-1">Max Price ($)</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="300"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Additional Specifications / Accessories Needed
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Must include original charger and box, looking for Space Grey color, 256GB or higher storage..."
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Location
  if (step === 3) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <WizardProgressBar currentStep={3} steps={['Item', 'Details', 'Location', 'Review']} />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
            Location & Radius
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Where would you like to arrange local pickup or meet-up?
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            City or Neighborhood
          </label>
          <input
            type="text"
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            placeholder="Search for a city or neighborhood"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Pickup Distance
          </label>
          <select
            value={locationRadius}
            onChange={(e) => setLocationRadius(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
          >
            <option value={5}>Within 5 miles</option>
            <option value={15}>Within 15 miles (Standard)</option>
            <option value={30}>Within 30 miles</option>
            <option value={50}>Within 50 miles</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 4: Review & Post
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <WizardProgressBar currentStep={4} steps={['Item', 'Details', 'Location', 'Review']} />

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          Review Item Request
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Review your criteria before publishing to local Aliwayz community sellers.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
          <span className="font-bold text-base text-[var(--color-text-primary)]">
            {title}
          </span>
          <button onClick={() => setStep(1)} className="text-xs font-bold text-emerald-600 hover:underline">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-2">
          <span className="text-[var(--color-text-muted)]">Budget:</span>
          <span className="font-bold text-emerald-600 text-right">
            {budgetMin || budgetMax
              ? `$${Number(budgetMin || 0).toLocaleString()} - $${Number(budgetMax || 0).toLocaleString()}`
              : 'Flexible'}
          </span>

          <span className="text-[var(--color-text-muted)]">Brand:</span>
          <span className="font-bold text-right">{brand || 'Any Brand'}</span>

          <span className="text-[var(--color-text-muted)]">Condition:</span>
          <span className="font-bold text-right capitalize">{condition || 'Any'}</span>

          <span className="text-[var(--color-text-muted)]">Location:</span>
          <span className="font-bold text-right">{locationCity || 'Philadelphia, PA'} ({locationRadius} mi)</span>
        </div>
      </div>

      {/* Duration Picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-2">
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Request Duration
        </label>
        <select
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-3 text-sm font-semibold text-[var(--color-text-primary)] focus:border-emerald-600 focus:outline-none"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Posting...' : 'Post Wanted Request'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
