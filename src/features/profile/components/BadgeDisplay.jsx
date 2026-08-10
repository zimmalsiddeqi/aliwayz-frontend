import BadgeCard from '@components/cards/BadgeCard';
import { useQuery } from '@tanstack/react-query';
import BadgeService from '@api/services/badge.service';
import { queryKeys } from '@lib/queryClient';
import EmptyState from '@components/common/EmptyState';

export default function BadgeDisplay({ userId }) {
  const { data: allBadges = [] } = useQuery({
    queryKey: queryKeys.badges.all(),
    queryFn:  () => BadgeService.getAll().then((r) => r.data),
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: queryKeys.badges.user(userId),
    queryFn:  () => BadgeService.getUserBadges(userId).then((r) => r.data),
    enabled:  !!userId,
  });

  const earnedCodes = new Set(userBadges.map((b) => b.code));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
        Badges ({userBadges.length}/{allBadges.length})
      </h3>
      {allBadges.length === 0 ? (
        <EmptyState icon="🏅" title="No badges available" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const earned = userBadges.find((b) => b.code === badge.code);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                awardedAt={earned?.awarded_at}
                earned={!!earned}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}