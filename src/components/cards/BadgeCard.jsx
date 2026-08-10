import { motion } from 'framer-motion';
import { cn } from '@lib/utils';
import { getBadgeDisplay } from '@utils/helpers';
import { formatDate } from '@utils/formatters';

export default function BadgeCard({ badge, awardedAt, earned = true }) {
  const display = getBadgeDisplay(badge?.code);

  return (
    <motion.div
      className={cn(
        'card p-4 text-center space-y-2 transition-all duration-200',
        !earned && 'opacity-40 grayscale'
      )}
      whileHover={earned ? { y: -3 } : {}}
    >
      <div
        className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl"
        style={{
          background: earned
            ? 'linear-gradient(135deg, var(--color-brand), #8B5CF6)'
            : 'var(--color-surface-elevated)',
        }}
      >
        {display.emoji}
      </div>

      <div>
        <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {badge?.name || display.label}
        </p>
        {badge?.description && (
          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
            {badge.description}
          </p>
        )}
      </div>

      {earned && awardedAt && (
        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          Earned {formatDate(awardedAt)}
        </p>
      )}

      {!earned && (
        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          Not yet earned
        </p>
      )}
    </motion.div>
  );
}