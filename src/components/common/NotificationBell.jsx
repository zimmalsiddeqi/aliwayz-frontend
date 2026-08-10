import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useNotificationStore from '@store/notification.store';

export default function NotificationBell() {
  const { unreadCount } = useNotificationStore();

  return (
    <Link
      to="/notifications"
      className="relative p-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)]"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}