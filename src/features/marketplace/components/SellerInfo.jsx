import { Link } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import { formatRating } from '@utils/formatters';

export default function SellerInfo({ store, seller }) {
  if (!store) return null;

  return (
    <Link
      to={`/store/${store.slug}`}
      className="glass-card block p-4 hover:border-[var(--color-brand)] transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Avatar src={store.logo_url} name={store.store_name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
              {store.store_name}
            </h4>
            {store.is_verified && <ShieldCheck size={14} style={{ color: 'var(--color-info)' }} />}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-0.5">
              <Star size={11} fill="var(--color-warning)" style={{ color: 'var(--color-warning)' }} />
              {formatRating(store.average_rating)}
            </span>
            {seller?.location_city && (
              <span className="flex items-center gap-0.5"><MapPin size={11} />{seller.location_city}</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </Link>
  );
}