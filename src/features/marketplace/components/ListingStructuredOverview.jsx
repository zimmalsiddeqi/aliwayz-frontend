import {
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Clock,
  Car,
  Gauge,
  Fuel,
  Cog,
  ShieldCheck,
  MapPin,
  FileText,
  DollarSign,
  Zap,
  Users,
  Layers,
  Sparkles,
  Check,
  CheckCircle2,
  Droplets,
  Flame,
  Wifi,
  Trash2,
  PawPrint,
  Ban,
  Home,
  Palette,
  Hash,
  User,
  Moon,
} from 'lucide-react';
import { parseStructuredListingData, getCleanDescriptionText } from '@utils/categoryHelpers';

const getIcon = (iconName, size = 16, className = '') => {
  switch (iconName) {
    case 'bed':
      return <Bed size={size} className={className} />;
    case 'bath':
      return <Bath size={size} className={className} />;
    case 'maximize':
      return <Maximize2 size={size} className={className} />;
    case 'calendar':
      return <Calendar size={size} className={className} />;
    case 'clock':
      return <Clock size={size} className={className} />;
    case 'car':
      return <Car size={size} className={className} />;
    case 'gauge':
      return <Gauge size={size} className={className} />;
    case 'fuel':
      return <Fuel size={size} className={className} />;
    case 'cog':
      return <Cog size={size} className={className} />;
    case 'shield':
      return <ShieldCheck size={size} className={className} />;
    case 'dollar':
      return <DollarSign size={size} className={className} />;
    case 'zap':
      return <Zap size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'layers':
      return <Layers size={size} className={className} />;
    case 'map-pin':
      return <MapPin size={size} className={className} />;
    case 'palette':
      return <Palette size={size} className={className} />;
    case 'hash':
      return <Hash size={size} className={className} />;
    case 'user':
      return <User size={size} className={className} />;
    case 'home':
      return <Home size={size} className={className} />;
    case 'moon':
      return <Moon size={size} className={className} />;
    default:
      return <FileText size={size} className={className} />;
  }
};

const getUtilityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('water')) return <Droplets size={14} className="text-blue-500" />;
  if (lower.includes('elect')) return <Zap size={14} className="text-amber-500" />;
  if (lower.includes('gas') || lower.includes('heat')) return <Flame size={14} className="text-orange-500" />;
  if (lower.includes('internet') || lower.includes('wifi')) return <Wifi size={14} className="text-indigo-500" />;
  if (lower.includes('trash') || lower.includes('sewer') || lower.includes('garbage')) return <Trash2 size={14} className="text-emerald-500" />;
  return <Check size={14} className="text-emerald-500" />;
};

export default function ListingStructuredOverview({ product }) {
  if (!product) return null;

  const data = parseStructuredListingData(product.description, product.category_id, product);
  const cleanRawDesc = getCleanDescriptionText(product.description);

  // If this is not a structured automotive or real estate listing and has no parsed specs/features,
  // fallback to a clean, formatted description card.
  if (!data.isRealEstate && !data.isAutomotive && data.specifications.length === 0 && data.features.length === 0) {
    if (!cleanRawDesc) return null;
    return (
      <div
        className="space-y-3 p-4 sm:p-5 rounded-2xl border transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
          Description
        </h3>
        <div className="whitespace-pre-line text-sm leading-relaxed font-normal text-[var(--color-text-secondary)]">
          {cleanRawDesc}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Top Highlights Grid (Quick Stat Cards) ──── */}
      {data.highlights.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {data.highlights.map((h, i) => (
            <div
              key={i}
              className="p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  color: 'var(--color-brand)',
                }}
              >
                {getIcon(h.icon, 18)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] truncate">
                  {h.label}
                </p>
                <p className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate">
                  {h.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 2. Detailed Specifications Grid ──── */}
      {data.specifications.length > 0 && (
        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[var(--color-brand)]" />
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
              {data.isRealEstate
                ? 'Property Overview'
                : data.isAutomotive
                ? 'Vehicle Specifications'
                : 'Listing Details'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            {data.specifications.map((spec, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-dashed border-[var(--color-border)] last:border-none"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                  <span className="opacity-70">{getIcon(spec.icon, 14)}</span>
                  {spec.label}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] text-right">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Utilities Included (Real Estate) ──── */}
      {data.utilitiesIncluded.length > 0 && (
        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: 'rgba(16,185,129,0.04)',
            borderColor: 'rgba(16,185,129,0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
              Utilities Included in Rent
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.utilitiesIncluded.map((util, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                {getUtilityIcon(util)}
                {util}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Policies (Pet & Smoking Policy) ──── */}
      {data.policies.length > 0 && (
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
            Property Policies & Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.policies.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {p.icon === 'pet' ? (
                  <PawPrint size={16} className="text-amber-500 shrink-0" />
                ) : p.icon === 'smoke' ? (
                  <Ban size={16} className="text-rose-500 shrink-0" />
                ) : (
                  <Clock size={16} className="text-blue-500 shrink-0" />
                )}
                <div className="min-w-0 text-xs">
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                    {p.label}
                  </p>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    {p.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Features & Amenities Chips ──── */}
      {data.features.length > 0 && (
        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-brand)]" />
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
              {data.isRealEstate
                ? 'Amenities & Features'
                : data.isAutomotive
                ? 'Features & Equipment'
                : 'Key Features'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.features.map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Check size={12} className="text-[var(--color-brand)] stroke-[2.5]" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Seller's Narrative Description (Prose) ──── */}
      {data.narrativeText ? (
        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
            {data.isRealEstate
              ? 'About this Property'
              : data.isAutomotive
              ? 'Seller Notes & Overview'
              : 'Description'}
          </h3>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)] font-normal">
            {data.narrativeText}
          </div>
        </div>
      ) : null}
    </div>
  );
}
