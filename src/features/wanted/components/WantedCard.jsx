import { MapPin, Clock, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@lib/utils';

// Helper for fallback preview images
const getFallbackImage = (request = {}) => {
  const { category, title = '', images, image_url } = request;
  if (images && images.length > 0 && images[0]) return images[0];
  if (image_url) return image_url;

  const t = title.toLowerCase();
  if (t.includes('iphone') || t.includes('phone') || t.includes('apple')) {
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=70';
  }
  if (t.includes('ps5') || t.includes('playstation') || t.includes('xbox') || t.includes('console')) {
    return 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=70';
  }
  if (t.includes('sofa') || t.includes('couch') || t.includes('sectional')) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=70';
  }
  if (t.includes('dining') || t.includes('table') || t.includes('chair')) {
    return 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&auto=format&fit=crop&q=70';
  }
  if (t.includes('camry') || t.includes('toyota') || t.includes('sedan') || t.includes('car') || category === 'automotive') {
    return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&auto=format&fit=crop&q=70';
  }
  if (category === 'electronics') {
    return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop&q=70';
  }
  if (category === 'real_estate') {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=70';
  }
  if (category === 'fashion') {
    return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=70';
  }
  if (category === 'home') {
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=70';
  }
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=70';
};

// Relative time formatter
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Posted recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Posted just now';
    if (diffHours < 24) return `Posted ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Posted ${diffDays}d ago`;
  } catch {
    return 'Posted recently';
  }
};

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
    budget_min,
    budget_max,
    location_city,
    location_neighborhood,
    location_radius,
    created_at,
    views_count,
    views,
    wanted_matches = [],
    status = 'active',
  } = request || {};

  const matchesCount = Array.isArray(wanted_matches)
    ? wanted_matches.length
    : (wanted_matches?.count || request?.matches_count || 0);

  // Format budget text
  const formatPrice = (val) => {
    if (!val || val === 0) return null;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Number(val).toLocaleString()}`;
    return `$${val.toLocaleString()}`;
  };

  const minFormatted = formatPrice(budget_min);
  const maxFormatted = formatPrice(budget_max);

  let budgetDisplay = '';
  if (minFormatted && maxFormatted) {
    budgetDisplay = `${minFormatted} – ${maxFormatted}`;
  } else if (maxFormatted) {
    budgetDisplay = `Up to ${maxFormatted}`;
  } else if (minFormatted) {
    budgetDisplay = `From ${minFormatted}`;
  } else {
    budgetDisplay = 'Flexible Budget';
  }

  if (intent === 'rent') {
    budgetDisplay += '/mo';
  }

  // Location display
  const neighborhoodPart = location_neighborhood ? `${location_neighborhood}, ` : '';
  const cityPart = location_city || 'Philadelphia, PA';
  const radiusPart = location_radius ? ` (within ${location_radius} miles)` : '';
  const locationDisplay = `${neighborhoodPart}${cityPart}${radiusPart}`;

  // Real Time & Views strictly from database
  const timeAgoText = formatTimeAgo(created_at);
  const viewsDisplay = Number(views_count || views || 0);

  const imageUrl = getFallbackImage(request);

  const handleCardClick = () => {
    if (onViewMatches) {
      onViewMatches(request);
    } else if (onIHaveThis) {
      onIHaveThis(request);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-3 sm:gap-4 cursor-pointer"
    >
      {/* Left Thumbnail Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70">
        <img
          src={imageUrl}
          alt={title || 'Wanted item'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=70';
          }}
        />
      </div>

      {/* Middle Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {title || 'Wanted Item'}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium mt-0.5">
          Budget: <span className="font-bold text-[var(--color-text-primary)]">{budgetDisplay}</span>
        </p>
        <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 truncate">
          <MapPin size={12} className="shrink-0 text-gray-400" />
          <span className="truncate">{locationDisplay}</span>
        </p>
        <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[var(--color-text-muted)] mt-1.5">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeAgoText}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {viewsDisplay} views
          </span>
        </div>
      </div>

      {/* Right Column: Status Badge, Match Count, Chevron */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1 sm:gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold',
              status === 'paused'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                status === 'paused' ? 'bg-blue-500' : 'bg-emerald-500'
              )}
            />
            {status === 'paused' ? 'Paused' : 'Active'}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-[var(--color-text-muted)]">
            {matchesCount} {matchesCount === 1 ? 'match' : 'matches'}
          </span>
        </div>
        <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
