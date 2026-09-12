import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { cn, getNotificationIcon, formatRelativeTime } from '@lib/utils';

export default function NotificationCard({ notification, onRead, onDelete, index = 0 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead?.(notification.id);
    const d = notification.data || {};
    if (d.conversationId) navigate(`/inbox/${d.conversationId}`);
    else if (d.productId)  navigate(`/product/${d.productId}`);
    else if (d.storeSlug)  navigate(`/store/${d.storeSlug}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={cn(
        'group relative w-full flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer transition-all duration-200 hover:bg-[var(--glass-bg-strong)]',
        !notification.is_read && 'bg-[var(--glass-bg)]'
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={cn('text-sm', !notification.is_read && 'font-semibold')}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {notification.title}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
          {notification.body}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        {!notification.is_read && (
          <div className="pulse-dot flex-shrink-0" />
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}