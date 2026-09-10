import { useState } from 'react';
import { Home, Bed, Bath, Maximize2, MapPin, CheckCircle2, Users, Sparkles, Car, ShieldCheck } from 'lucide-react';
import { cn } from '@lib/utils';
import Button from '@components/ui/Button';

export default function WantedCard({
  request,
  onIHaveThis,
  onViewMatches,
  isOwner = false,
  showActions = true,
}) {
  const {
    id,
    title,
    category,
    intent,
    item_type,
    budget_min,
    budget_max,
    currency = 'USD',
    location_city,
    location_radius,
    bedrooms,
    bathrooms,
    property_size,
    features = [],
    wanted_matches = [],
    status = 'active',
    users: buyer,
  } = request || {};

  const matchesCount = Array.isArray(wanted_matches)
    ? wanted_matches.length
    : (wanted_matches?.count || request?.matches_count || 0);

  // Format budget text
  const formatPrice = (val) => {
    if (!val || val === 0) return null;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val.toLocaleString()}`;
  };

  const minFormatted = formatPrice(budget_min);
  const maxFormatted = formatPrice(budget_max);

  let budgetDisplay = '';
  if (minFormatted && maxFormatted) {
    budgetDisplay = `${minFormatted} - ${maxFormatted}`;
  } else if (maxFormatted) {
    budgetDisplay = `Up to ${maxFormatted}`;
  } else if (minFormatted) {
    budgetDisplay = `From ${minFormatted}`;
  } else {
    budgetDisplay = 'Flexible Budget';
  }

  const intentLabel = intent === 'rent' ? 'Rent' : intent === 'lease' ? 'Lease' : 'Buy';
  const rentSuffix = intent === 'rent' ? '/mo' : '';

  return (
    <div className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-brand)]/40 flex flex-col justify-between">
      {/* Top row: Title + Status / Buyers Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {category === 'automotive' ? <Car size={18} /> : <Home size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)] leading-tight line-clamp-1">
                {title || 'Wanted Request'}
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {intentLabel} • {budgetDisplay}{rentSuffix}
              </p>
            </div>
          </div>

          {/* Status Badge or Buyer count */}
          {isOwner ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Users size={12} />
              <span>{matchesCount > 0 ? `${matchesCount} matches` : 'Active'}</span>
            </span>
          )}
        </div>

        {/* Location line */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-3">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">
            {location_city || 'Philadelphia, PA'} {location_radius ? `(within ${location_radius} miles)` : ''}
          </span>
        </div>

        {/* Specs Attributes Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-4">
          {bedrooms && (
            <span className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-secondary)] px-2 py-1 font-medium">
              <Bed size={13} />
              {bedrooms} {bedrooms.includes('+') ? 'beds' : 'bed'}
            </span>
          )}
          {bathrooms && (
            <span className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-secondary)] px-2 py-1 font-medium">
              <Bath size={13} />
              {bathrooms} bath
            </span>
          )}
          {property_size && (
            <span className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-secondary)] px-2 py-1 font-medium">
              <Maximize2 size={13} />
              {property_size} sqft
            </span>
          )}
          {features?.slice(0, 2).map((feat, idx) => (
            <span key={idx} className="rounded-lg bg-[var(--color-bg-secondary)] px-2 py-1 font-medium text-[11px]">
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="border-t border-[var(--color-border)] pt-3 flex items-center justify-between gap-2 mt-auto">
        {isOwner ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {matchesCount > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {matchesCount} {matchesCount === 1 ? 'match' : 'matches'} found
                </span>
              ) : (
                'Waiting for sellers...'
              )}
            </span>
            <button
              onClick={() => onViewMatches?.(request)}
              className="text-xs font-semibold text-[var(--color-brand)] hover:underline flex items-center gap-1"
            >
              View Details &gt;
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600">
                {buyer?.username?.[0]?.toUpperCase() || 'B'}
              </div>
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {buyer?.username || 'Verified Buyer'}
              </span>
            </div>

            {showActions && (
              <button
                onClick={() => onIHaveThis?.(request)}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand)] hover:opacity-90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all transform active:scale-95"
              >
                <Sparkles size={13} />
                <span>I Have This</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
