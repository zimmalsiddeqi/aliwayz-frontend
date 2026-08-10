import { Link } from 'react-router-dom';
import Avatar from '@components/ui/Avatar';
import BadgeUI from '@components/ui/Badge';
import { Star } from 'lucide-react';
import { formatRating, formatCompactNumber } from '@utils/formatters';

export default function FeaturedSellers({ sellers = [] }) {
  if (!sellers.length) return null;

  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>
        Featured Sellers
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {sellers.map((seller) => (
          <Link
            key={seller.user_id}
            to={`/store/${seller.store_slug}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl text-center w-36 transition-all duration-200 hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Avatar src={seller.avatar_url} name={seller.username} size="lg" />
            <div>
              <p className="text-xs font-semibold truncate w-full" style={{ color: 'var(--color-text-primary)' }}>
                {seller.username}
              </p>
              {seller.is_verified && <BadgeUI variant="info" size="xs" className="mt-0.5">Verified</BadgeUI>}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-warning)' }}>
              <Star size={11} fill="currentColor" />
              {formatRating(seller.average_rating)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}