import {
  MapPin,
  Clock,
  Eye,
  ChevronRight,
  Smartphone,
  Laptop,
  Gamepad2,
  Car,
  Truck,
  Home,
  Building2,
  Shirt,
  Watch,
  Sofa,
  ShoppingBag,
  Users,
  Sparkles,
} from 'lucide-react';
import { cn } from '@lib/utils';

// Helper to render high quality category/item icon when no user image is provided
function renderWantedIcon(category = '', title = '') {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  let IconComponent = ShoppingBag;
  let gradientClass = 'from-indigo-500 to-purple-600';

  if (cat === 'automotive' || t.includes('car') || t.includes('truck') || t.includes('toyota') || t.includes('honda') || t.includes('sedan') || t.includes('suv') || t.includes('vehicle')) {
    IconComponent = t.includes('truck') ? Truck : Car;
    gradientClass = 'from-emerald-500 to-teal-600';
  } else if (cat === 'real_estate' || t.includes('apartment') || t.includes('house') || t.includes('condo') || t.includes('rent') || t.includes('property') || t.includes('flat')) {
    IconComponent = t.includes('apartment') || t.includes('building') ? Building2 : Home;
    gradientClass = 'from-violet-500 to-purple-600';
  } else if (cat === 'electronics' || t.includes('iphone') || t.includes('phone') || t.includes('laptop') || t.includes('macbook') || t.includes('ps5') || t.includes('console')) {
    if (t.includes('laptop') || t.includes('macbook') || t.includes('computer')) {
      IconComponent = Laptop;
    } else if (t.includes('ps5') || t.includes('playstation') || t.includes('xbox') || t.includes('game') || t.includes('nintendo')) {
      IconComponent = Gamepad2;
    } else {
      IconComponent = Smartphone;
    }
    gradientClass = 'from-blue-500 to-indigo-600';
  } else if (cat === 'fashion' || t.includes('shirt') || t.includes('shoe') || t.includes('jacket') || t.includes('watch') || t.includes('dress') || t.includes('clothes')) {
    IconComponent = t.includes('watch') ? Watch : Shirt;
    gradientClass = 'from-rose-500 to-pink-600';
  } else if (cat === 'home' || t.includes('sofa') || t.includes('couch') || t.includes('table') || t.includes('chair') || t.includes('desk') || t.includes('bed') || t.includes('furniture')) {
    IconComponent = Sofa;
    gradientClass = 'from-amber-500 to-orange-600';
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-inner`}>
      <IconComponent size={26} className="drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
    </div>
  );
}

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

  const buyersCount = Number(request?.buyers_count || request?.buyer_count || 1);

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

  const userImage = (request?.images && request.images.length > 0 && request.images[0]) || request?.image_url;

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
      {/* Left Thumbnail (User Image or High Quality Category Icon) */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70 shadow-sm flex items-center justify-center">
        {userImage ? (
          <img
            src={userImage}
            alt={title || 'Wanted item'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          renderWantedIcon(category, title)
        )}
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
          <span className="flex items-center gap-1 text-[#5046e5] dark:text-indigo-400 font-semibold">
            <Users size={11} />
            {buyersCount} {buyersCount === 1 ? 'Buyer' : 'Buyers'}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {viewsDisplay} views
          </span>
        </div>
      </div>

      {/* Right Column: Buyer Count, I Have This Button & Status */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-2">
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
        </div>

        {showActions && (
          isOwner ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewMatches) {
                  onViewMatches(request);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles size={13} />
              <span>View Matches</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onIHaveThis) {
                  onIHaveThis(request);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-indigo-500/20 transition-all transform active:scale-95"
            >
              <Sparkles size={13} />
              <span>I Have This</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
