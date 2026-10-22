import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Package,
  BarChart3,
  Settings,
  LayoutDashboard,
  X,
  ChevronRight,
  MessageCircle,
  Bookmark,
  MapPin,
  Home,
} from 'lucide-react';
import Navbar from '@components/common/Navbar';
import LoadingScreen from '@components/common/LoadingScreen';
import useAuthStore from '@store/auth.store';
import useMyStore from '@hooks/useMyStore';
import useChatStore from '@store/chat.store';
import { parseStoreMeta } from '@utils/sellerMeta';
import { cn } from '@lib/utils';

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const { store, hasStore, isLoading } = useMyStore();
  const { totalUnread } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const storeMeta = parseStoreMeta(store);
  const sellerMode =
    typeof window !== 'undefined' && user?.id
      ? localStorage.getItem(`aliwayz_seller_mode_${user.id}`)
      : null;

  const isBusinessSeller = Boolean(
    hasStore &&
      (storeMeta.isBusinessProfile || sellerMode === 'business') &&
      sellerMode !== 'personal'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <div className="flex flex-1 pt-navbar">
        {/* Mobile floating Seller Dashboard button */}
        <motion.button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full px-3.5 py-2.5 shadow-2xl border border-white/20 text-white lg:hidden backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
            boxShadow: '0 10px 25px -3px rgba(37, 99, 235, 0.5), 0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open Seller Dashboard Menu"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <LayoutDashboard size={14} className="text-white stroke-[2.4]" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white drop-shadow-sm pr-1">
            Dashboard
          </span>
        </motion.button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                className="fixed bottom-0 left-0 top-0 z-50 w-72 overflow-y-auto p-5 pt-6 lg:hidden shadow-2xl border-r border-[var(--color-border)]"
                style={{ backgroundColor: 'var(--color-surface)' }}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      }}
                    >
                      <LayoutDashboard size={16} />
                    </div>
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">
                      {isBusinessSeller ? 'Business Dashboard' : 'Seller Dashboard'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1.5 hover:bg-[var(--glass-bg-strong)] transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <SellerSidebar
                  store={store}
                  hasStore={hasStore}
                  isBusinessSeller={isBusinessSeller}
                  totalUnread={totalUnread}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside
          className="hidden w-72 flex-shrink-0 overflow-y-auto border-r p-5 lg:block"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="sticky top-20">
            <SellerSidebar
              store={store}
              hasStore={hasStore}
              isBusinessSeller={isBusinessSeller}
              totalUnread={totalUnread}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              <Outlet context={{ store, hasStore }} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Seller Sidebar (Adapts for Individual vs Business Seller) ────────
function SellerSidebar({
  store,
  hasStore,
  isBusinessSeller,
  totalUnread,
  onNavigate,
}) {
  // Links for Individual / Personal Seller ("7. Dashboard – Individual Seller")
  const individualLinks = [
    {
      to: '/dashboard',
      end: true,
      icon: Home,
      label: 'Dashboard',
    },
    {
      to: '/sell/my-listings',
      icon: Package,
      label: 'My Listings',
    },
    {
      to: '/inbox',
      icon: MessageCircle,
      label: 'Messages',
      badge: totalUnread,
    },
    {
      to: '/favorites',
      icon: Bookmark,
      label: 'Saved Items',
    },
    {
      to: '/profile/edit',
      icon: Settings,
      label: 'Profile Settings',
    },
  ];

  // Links for Business Seller ("8. Dashboard – Business Seller")
  const businessLinks = [
    {
      to: '/dashboard',
      end: true,
      icon: Home,
      label: 'Business Overview',
    },
    {
      to: '/sell/my-listings',
      icon: Package,
      label: 'Inventory',
    },
    {
      to: store?.slug ? `/store/${store.slug}` : '/my-store/edit',
      icon: Store,
      label: 'Business Profile',
    },
    {
      to: '/sell/create?mode=business&onboarding=business-edit',
      icon: MapPin,
      label: 'Location & Hours',
    },
    {
      to: '/my-store/analytics',
      icon: BarChart3,
      label: 'Performance',
      dot: true,
    },
    {
      to: '/my-store/edit',
      icon: Settings,
      label: 'Settings',
    },
  ];

  const links = isBusinessSeller ? businessLinks : individualLinks;

  return (
    <nav className="space-y-5">
      {/* Business Storefront Quick Card */}
      {isBusinessSeller && store && (
        <Link
          to={`/store/${store.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl p-3 transition-all hover:bg-[var(--glass-bg-strong)]"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.store_name}
              className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
            >
              {store.store_name?.[0] || 'B'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {store.store_name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              View public storefront
            </p>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        </Link>
      )}

      {/* Navigation links */}
      <div className="space-y-1">
        {links.map((item) => {
          const { to, end, icon: Icon, label, badge, dot, comingSoon } = item;

          if (comingSoon) {
            return (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium opacity-55 cursor-default select-none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap">
                  (Coming Soon)
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--glass-bg-strong)]'
                )
              }
              style={({ isActive }) => ({
                background: isActive
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  : undefined,
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                boxShadow: isActive
                  ? '0 6px 16px -4px rgba(37, 99, 235, 0.45)'
                  : undefined,
              })}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
                {dot && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
                    title="Active"
                  />
                )}
              </div>

              {badge > 0 && (
                <span
                  className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Upgrade to Business Storefront prompt for Individual Sellers */}
      {!isBusinessSeller && (
        <div
          className="rounded-2xl p-3.5 border space-y-2"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p
            className="text-xs font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Selling as a Business?
          </p>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Upgrade to a Business Storefront to unlock business hours, custom branding, and analytics.
          </p>
          <Link
            to="/sell/create?mode=business&onboarding=business-edit"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
            style={{ color: '#2563EB' }}
          >
            <span>Set Up Business Profile →</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
