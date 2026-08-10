import { MapPin, Star, ShoppingBag, Users, Share2 } from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import FollowButton from './FollowButton';
import useAuthStore from '@store/auth.store';
import { formatRating, formatCompactNumber } from '@utils/formatters';
import toast from '@lib/toast';

export default function StoreHeader({ store }) {
  const { user } = useAuthStore();
  const owner    = store?.users;
  const isOwner  = user?.id === owner?.id;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 relative z-10">
      <div className="rounded-2xl overflow-hidden border-4 flex-shrink-0" style={{ borderColor: 'var(--color-bg)' }}>
        <Avatar src={store.logo_url} name={store.store_name} size="2xl" />
      </div>

      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {store.store_name}
          </h1>
          {store.is_verified && <span title="Verified">✅</span>}
        </div>

        {store.description && (
          <p className="text-sm mt-1 line-clamp-2 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {store.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {store.location_city && (
            <span className="flex items-center gap-1"><MapPin size={12} />{store.location_city}</span>
          )}
          <span className="flex items-center gap-1">
            <Star size={12} fill="var(--color-warning)" style={{ color: 'var(--color-warning)' }} />
            {formatRating(store.average_rating)} ({store.total_reviews})
          </span>
          <span className="flex items-center gap-1"><ShoppingBag size={12} />{formatCompactNumber(store.total_sales)} sales</span>
          <span className="flex items-center gap-1"><Users size={12} />{formatCompactNumber(store.total_followers)} followers</span>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {!isOwner && <FollowButton storeSlug={store.slug} storeId={store.id} ownerId={owner?.id} />}
        <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
          <Share2 size={16} />
        </Button>
      </div>
    </div>
  );
}