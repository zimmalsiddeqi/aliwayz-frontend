import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Bookmark, Compass } from 'lucide-react';
import { cn } from '@lib/utils';
import useAuthStore from '@store/auth.store';

export default function WantedNavTabs() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const pathname = location.pathname;

  const tabs = [
    { to: '/wanted', label: 'Home', icon: Home, exact: true },
    { to: '/wanted/feed', label: 'Wanted', icon: Compass },
    { to: '/wanted/my-requests', label: 'My Requests', icon: Bookmark, authOnly: true },
    { to: '/wanted/create', label: 'Post Wanted', icon: PlusCircle, isCta: true },
  ];

  return (
    <div className="sticky top-14 sm:top-16 z-30 mb-4 sm:mb-6 border-b border-[var(--color-border)] bg-[var(--glass-bg-strong)] backdrop-blur-md">
      <div className="container-app flex items-center justify-between py-2 sm:py-3">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            if (tab.authOnly && !isAuthenticated) return null;

            const isActive = tab.exact 
              ? pathname === tab.to 
              : pathname.startsWith(tab.to);

            const Icon = tab.icon;

            if (tab.isCta) return null;

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
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

        {/* Post Wanted Button */}
        <Link
          to={isAuthenticated ? '/wanted/create' : '/login?redirect=/wanted/create'}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-blue-500/20 whitespace-nowrap transition-all transform active:scale-95"
        >
          <PlusCircle size={16} />
          <span>Post Wanted</span>
        </Link>
      </div>
    </div>
  );
}
