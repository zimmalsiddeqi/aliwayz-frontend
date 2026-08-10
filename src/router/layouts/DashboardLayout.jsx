import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Package,
  PlusCircle,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@components/common/Navbar';
import LoadingScreen from '@components/common/LoadingScreen';
import Button from '@components/ui/Button';
import useMyStore from '@hooks/useMyStore';
import { cn } from '@lib/utils';

const sellerLinks = [
  { to: '/sell/my-listings', icon: Package, label: 'My Listings' },
  { to: '/sell/create', icon: PlusCircle, label: 'New Listing' },
  { to: '/my-store/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/my-store/edit', icon: Settings, label: 'Seller Settings' },
];

export default function DashboardLayout() {
  const { store, hasStore, isLoading } = useMyStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <div className="flex flex-1 pt-navbar">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-brand fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg lg:hidden"
        >
          <Menu size={20} />
        </button>

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
                className="fixed bottom-0 left-0 top-0 z-50 w-72 overflow-y-auto p-5 pt-20 lg:hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={18} />
                </button>
                <SellerSidebar
                  store={store}
                  hasStore={hasStore}
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
            <SellerSidebar store={store} hasStore={hasStore} />
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

// ── Seller Sidebar ────────────────────────────────────────────
function SellerSidebar({ store, hasStore, onNavigate }) {
  return (
    <nav className="space-y-6">
      {/* Store info */}
      {hasStore && store && (
        <Link
          to={`/store/${store.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-[var(--glass-bg-strong)]"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.store_name}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-white">
              {store.store_name?.[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {store.store_name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              View public store
            </p>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        </Link>
      )}

      {!hasStore && (
        <Link to="/store/create" onClick={onNavigate}>
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{
              backgroundColor: 'var(--color-brand-glow)',
              border: '1px solid var(--color-brand)',
            }}
          >
            <Store size={18} style={{ color: 'var(--color-brand)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
              Set Up Seller Profile
            </span>
          </div>
        </Link>
      )}

      {/* Navigation links */}
      <div className="space-y-1">
        <p
          className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Seller Dashboard
        </p>

        {sellerLinks.map(({ to, icon: Icon, label }) => {
          const isDisabled = !hasStore && to !== '/store/create';

          return (
            <NavLink
              key={to}
              to={isDisabled ? '#' : to}
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
                else onNavigate?.();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive && !isDisabled ? 'text-white' : '',
                  isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-[var(--glass-bg-strong)]'
                )
              }
              style={({ isActive }) => ({
                background:
                  isActive && !isDisabled
                    ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))'
                    : undefined,
                color: isActive && !isDisabled ? 'white' : 'var(--color-text-secondary)',
                boxShadow: isActive && !isDisabled ? 'var(--shadow-brand)' : undefined,
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ── No Store Prompt ───────────────────────────────────────────
function NoStorePrompt() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        className="mx-auto max-w-md space-y-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <Store size={36} className="text-white" />
        </div>

        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            Set Up Your Seller Profile
          </h2>
          <p
            className="mx-auto mt-2 max-w-sm text-sm"
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            Create your seller profile to manage all your listings in one place. It only takes a
            minute!
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/store/create">
            <Button size="lg" leftIcon={<Store size={18} />}>
              Create Seller Profile
            </Button>
          </Link>
        </div>

        <div
          className="grid grid-cols-3 gap-3 pt-4"
          style={{
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {[
            {
              icon: '📦',
              label: 'Unlimited listings',
            },
            {
              icon: '📊',
              label: 'Sales analytics',
            },
            {
              icon: '⭐',
              label: 'Seller ratings',
            },
          ].map((f) => (
            <div key={f.label} className="p-3 text-center">
              <span className="text-2xl">{f.icon}</span>
              <p
                className="mt-1 text-xs"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
