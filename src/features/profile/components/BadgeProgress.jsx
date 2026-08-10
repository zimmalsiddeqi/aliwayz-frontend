import { useQuery } from '@tanstack/react-query';
import BadgeService from '@api/services/badge.service';
import { queryKeys } from '@lib/queryClient';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import { cn } from '@lib/utils';
import { getBadgeDisplay } from '@utils/helpers';

export default function BadgeProgress() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.badges.progress(),
    queryFn:  () => BadgeService.getProgress(),
  });

  const progress = data?.data?.progress || [];

  if (isLoading) return <div className="flex justify-center py-6"><Spinner size="md" /></div>;

  return (
    <div className="space-y-3">
      {progress.map((badge) => {
        const display    = getBadgeDisplay(badge.code);
        const allMet     = badge.requirements.every((r) => r.met);

        return (
          <Card key={badge.code} className={cn('p-4', allMet && 'border-[var(--color-success)]/30')}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{display.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {badge.name}
                </p>
                {allMet && <p className="text-xs" style={{ color: 'var(--color-success)' }}>✅ Earned!</p>}
              </div>
            </div>

            <div className="space-y-2">
              {badge.requirements.map((req, i) => {
                const pct = Math.min((req.current / req.required) * 100, 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{req.label}</span>
                      <span>{req.current}/{req.required}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: req.met ? 'var(--color-success)' : 'var(--color-brand)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}