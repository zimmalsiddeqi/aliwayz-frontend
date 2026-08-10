import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, getNotificationIcon, formatRelativeTime } from '@lib/utils';

export default function NotificationCard({ notification, onRead, index = 0 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead?.(notification.id);
    const d = notification.data || {};
    if (d.conversationId) navigate(`/inbox/${d.conversationId}`);
    else if (d.productId)  navigate(`/product/${d.productId}`);
    else if (d.storeSlug)  navigate(`/store/${d.storeSlug}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200 hover:bg-[var(--glass-bg-strong)]',
        !notification.is_read && 'bg-[var(--glass-bg)]'
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
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

      {!notification.is_read && (
        <div className="pulse-dot mt-2 flex-shrink-0" />
      )}
    </motion.button>
  );
}