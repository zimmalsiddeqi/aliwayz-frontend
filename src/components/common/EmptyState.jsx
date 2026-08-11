import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@components/ui/Button';

export default function EmptyState({
  icon = '📦',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
}) {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-xs mx-auto mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}