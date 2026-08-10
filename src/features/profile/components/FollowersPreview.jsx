import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import useMyStore from '@hooks/useMyStore';
import FollowerService from '@api/services/follower.service';
import Avatar from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import { formatCompactNumber } from '@utils/formatters';

export default function FollowersPreview({ userId }) {
  const { store } = useMyStore();

  const { data } = useQuery({
    queryKey: ['my-store-followers', store?.id],
    queryFn: () =>
      FollowerService.getStoreFollowers(store.id, {
        page: 1,
        limit: 8,
      }),
    enabled: !!store?.id,
  });

  const followers = (data?.data || [])
    .map((f) => f.follower || f.users)
    .filter(Boolean);
  const totalFollowers = data?.pagination?.total || 0;

  if (followers.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users
            size={16}
            style={{ color: 'var(--color-info)' }}
          />
          <h3
            className="font-semibold text-sm"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            Followers
          </h3>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor:
                'var(--color-surface-elevated)',
              color: 'var(--color-text-muted)',
            }}
          >
            {formatCompactNumber(totalFollowers)}
          </span>
        </div>

        {store && (
          <Link
            to={`/store/${store.slug}`}
            className="flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            View all{' '}
            <ChevronRight size={12} />
          </Link>
        )}
      </div>

      {/* Follower avatars row */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {followers.slice(0, 6).map((follower) => (
            <Link
              key={follower.id}
              to={`/user/${follower.username}`}
              title={follower.username}
            >
              <Avatar
                src={follower.avatar_url}
                name={follower.username}
                size="sm"
                className="ring-2"
                style={{
                  ringColor: 'var(--color-surface)',
                }}
              />
            </Link>
          ))}
        </div>

        {totalFollowers > 6 && (
          <span
            className="text-xs font-medium"
            style={{
              color: 'var(--color-text-muted)',
            }}
          >
            +{totalFollowers - 6} more
          </span>
        )}
      </div>

      {/* Recent follower names */}
      <p
        className="text-xs mt-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {followers
          .slice(0, 3)
          .map((f) => f.username)
          .join(', ')}
        {totalFollowers > 3 &&
          ` and ${totalFollowers - 3} others`}
      </p>
    </Card>
  );
}