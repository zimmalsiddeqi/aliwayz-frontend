import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '@components/ui/Avatar';
import BadgeUI from '@components/ui/Badge';
import { formatCompactNumber, formatRating } from '@utils/formatters';

const StoreCard = memo(function StoreCard({ store, variant = 'default' }) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/store/${store.slug}`}
        className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
      >
        <Avatar src={store.logo_url} name={store.store_name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {store.store_name}
            </p>
            {store.is_verified && <span className="text-xs">✅</span>}
          </div>
          <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {store.location_city || 'Location not set'}
          </p>
        </div>
        {store.average_rating > 0 && store.total_reviews > 0 ? (
          <span className="flex items-center gap-0.5">
            <Star size={12} fill="var(--color-warning)" style={{ color: 'var(--color-warning)' }} />
            {formatRating(store.average_rating)}
          </span>
        ) : (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: 'rgba(91,110,245,0.1)',
              color: 'var(--color-brand)',
            }}
          >
            New Seller
          </span>
        )}
      </Link>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={`/store/${store.slug}`} className="card-interactive block overflow-hidden">
        {/* Banner */}
        <div
          className="relative h-24 sm:h-28"
          style={{
            background: store.banner_url
              ? `url(${store.banner_url}) center/cover`
              : 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative -mt-8 p-4">
          <div className="mb-3 flex items-end gap-3">
            <div
              className="flex-shrink-0 overflow-hidden rounded-xl border-2"
              style={{ borderColor: 'var(--color-surface)' }}
            >
              <Avatar src={store.logo_url} name={store.store_name} size="lg" />
            </div>
            <div className="min-w-0 flex-1 pb-0.5">
              <div className="flex items-center gap-1.5">
                <h3
                  className="truncate text-sm font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {store.store_name}
                </h3>
                {store.is_verified && <span className="flex-shrink-0 text-xs">✅</span>}
              </div>
              {store.location_city && (
                <p
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <MapPin size={10} />
                  {store.location_city}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span className="flex items-center gap-1">
              <Star
                size={12}
                style={{ color: 'var(--color-warning)' }}
                fill="var(--color-warning)"
              />
              {formatRating(store.average_rating)}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag size={12} />
              {formatCompactNumber(store.total_sales)} sales
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {formatCompactNumber(store.total_followers)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default StoreCard;
