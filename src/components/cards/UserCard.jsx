import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '@components/ui/Avatar';
import BadgeUI from '@components/ui/Badge';
import { cn } from '@lib/utils';
import { formatRating } from '@utils/formatters';
import { getBadgeDisplay } from '@utils/helpers';

export default function UserCard({ user, variant = 'default' }) {
  const badges = (user?.user_badges || []).filter((b) => b.is_active).slice(0, 2);

  if (variant === 'compact') {
    return (
      <Link
        to={`/user/${user.username}`}
        className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--glass-bg-strong)]"
      >
        <Avatar src={user.avatar_url} name={user.username} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
            {user.full_name || user.username}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            @{user.username}
          </p>
        </div>
        {user.seller_stats?.average_rating > 0 && (
          <div className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-warning)' }}>
            <Star size={11} fill="currentColor" />
            {formatRating(user.seller_stats.average_rating)}
          </div>
        )}
      </Link>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={`/user/${user.username}`} className="card-interactive block p-5 text-center">
        <Avatar src={user.avatar_url} name={user.username} size="xl" className="mx-auto" />
        <h3 className="font-bold text-sm mt-3" style={{ color: 'var(--color-text-primary)' }}>
          {user.full_name || user.username}
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{user.username}</p>

        {user.location_city && (
          <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={10} />{user.location_city}
          </p>
        )}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {badges.map((ub) => {
              const d = getBadgeDisplay(ub.badges?.code);
              return (
                <span key={ub.badges?.code} className={cn('badge text-[10px]', d.color)}>
                  {d.emoji} {ub.badges?.name}
                </span>
              );
            })}
          </div>
        )}

        {user.seller_stats && (
          <div className="flex justify-center gap-4 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="flex items-center gap-0.5">
              <Star size={11} style={{ color: 'var(--color-warning)' }} fill="var(--color-warning)" />
              {formatRating(user.seller_stats.average_rating)}
            </span>
            <span>{user.seller_stats.total_sales} sales</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}