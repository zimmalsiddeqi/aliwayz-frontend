import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark } from 'lucide-react';
import { cn } from '@lib/utils';
import useAuthStore from '@store/auth.store';

export default function WantedNavTabs() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const pathname = location.pathname;

  const tabs = [
    { to: '/wanted', label: 'Home', icon: Home, exact: true },
    { to: '/wanted/feed', label: 'Wanted', icon: Compass },
    {
      to: isAuthenticated ? '/wanted/my-requests' : '/login?redirect=/wanted/my-requests',
      label: 'My Requests',
      icon: Bookmark,
    },
  ];

  return (
    <div className="sticky top-14 sm:top-16 z-30 mb-4 sm:mb-6 border-b border-[var(--color-border)] bg-[var(--glass-bg-strong)] backdrop-blur-md">
      <div className="container-app py-2 sm:py-2.5">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === '/wanted'
              : pathname === tab.to || (tab.to.startsWith('/wanted/feed') && pathname.startsWith('/wanted/feed')) || (tab.to.startsWith('/wanted/my-requests') && pathname.startsWith('/wanted/my-requests'));

            const Icon = tab.icon;

            return (
              <Link
                key={tab.label}
                to={tab.to}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[var(--color-brand)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
