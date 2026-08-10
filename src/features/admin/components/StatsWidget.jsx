import { motion } from 'framer-motion';
import { Card } from '@components/ui/Card';
import { formatCompactNumber } from '@utils/formatters';

export default function StatsWidget({ label, value, icon: Icon, color, trend, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={20} />
          </div>
          {trend !== undefined && (
            <span className="text-xs font-medium" style={{ color: trend >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {typeof value === 'number' ? formatCompactNumber(value) : value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      </Card>
    </motion.div>
  );
}