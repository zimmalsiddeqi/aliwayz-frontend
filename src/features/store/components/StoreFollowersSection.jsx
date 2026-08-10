import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import FollowerService from '@api/services/follower.service';
import Avatar from '@components/ui/Avatar';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import { formatRelativeTime } from '@utils/formatters';

export default function StoreFollowersSection({ storeId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['store-followers', storeId],
    queryFn: () =>
      FollowerService.getStoreFollowers(storeId, {
        page: 1,
        limit: 50,
      }),
    enabled: !!storeId,
  });

  const followers = (data?.data || [])
    .map((f) => f.follower || f.users)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No followers yet"
        description="When people follow this store, they'll appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Users size={16} />
        <span className="text-sm font-medium">
          {followers.length} follower
          {followers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {followers.map((follower, i) => (
          <motion.div
            key={follower.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/user/${follower.username}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
              style={{
                border: '1px solid var(--color-border)',
              }}
            >
              <Avatar
                src={follower.avatar_url}
                name={follower.username}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {follower.username}
                </p>
                {follower.location_city && (
                  <p
                    className="text-xs truncate"
                    style={{
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {follower.location_city}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}