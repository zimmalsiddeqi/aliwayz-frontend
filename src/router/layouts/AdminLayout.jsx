import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Flag,
  ScrollText,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Shield,
  LogOut,
  ChevronRight,
  Search,
  BellRing,
  Moon,
  Sun,
  MessageSquare,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import useAuthStore from '@store/auth.store';
import useUIStore from '@store/ui.store';
import useNotificationStore from '@store/notification.store';
import Avatar from '@components/ui/Avatar';
import LoadingScreen from '@components/common/LoadingScreen';
import { cn } from '@lib/utils';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      {
        to:    '/admin',
        icon:  LayoutDashboard,
        label: 'Dashboard',
        end:   true,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/users',      icon: Users,      label: 'Users' },
      { to: '/admin/stores',     icon: Store,      label: 'Stores' },
      { to: '/admin/products',    icon: Package,    label: 'Products' },
      { to: '/admin/categories',  icon: FolderOpen, label: 'Categories' },
    ],
  },
  {
    title: 'Moderation',
    items: [
      {
        to:    '/admin/verifications',
        icon:  ShieldCheck,
        label: 'Verifications',
        badge: true,
      },
      {
        to:    '/admin/reports',
        icon:  Flag,
        label: 'Reports',
        badge: true,
      },
      {
        to:    '/admin/logs',
        icon:  ScrollText,
        label: 'Activity Logs',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        to:    '/admin/broadcast',
        icon:  BellRing,
        label: 'Broadcast',
      },
      {
        to:    '/admin/feedback',
        icon:  MessageSquare,
        label: 'User Feedback',
        badge: true,
      },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* ═══ MOBILE OVERLAY ════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══════════════════════════════════════ */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 lg:sticky',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-[70px]' : 'w-[260px]'
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* ── Logo Header ─────────────────────────────────── */}
        <div
          className="flex h-16 flex-shrink-0 items-center justify-between px-4"
          style={{
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                }}
              >
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Aliwayz
                </span>
                <span
                  className="-mt-0.5 block text-[9px] font-semibold"
                  style={{
                    color: 'var(--color-brand)',
                  }}
                >
                  ADMIN
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link
              to="/admin"
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              }}
            >
              <Shield size={16} className="text-white" />
            </Link>
          )}

          {/* Close mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 lg:hidden"
            style={{
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={18} />
          </button>

          {/* Collapse toggle desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 transition-colors hover:bg-[var(--glass-bg-strong)] lg:flex"
            style={{
              color: 'var(--color-text-muted)',
            }}
          >
            <ChevronLeft
              size={16}
              className={cn('transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────────────── */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p
                  className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {section.title}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label, end, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        collapsed && 'justify-center px-0',
                        isActive ? '' : 'hover:bg-[var(--glass-bg-strong)]'
                      )
                    }
                    style={({ isActive }) => ({
                      background: isActive
                        ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))'
                        : undefined,
                      color: isActive ? 'white' : 'var(--color-text-secondary)',
                      boxShadow: isActive ? '0 4px 15px var(--color-brand-glow)' : undefined,
                    })}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={collapsed ? 20 : 18} />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {badge && unreadCount > 0 && !collapsed && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                    {badge && unreadCount > 0 && collapsed && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-red" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom Section ──────────────────────────────── */}
        <div
          className="flex-shrink-0 space-y-2 p-3"
          style={{
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--glass-bg-strong)]',
              collapsed && 'justify-center px-0'
            )}
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* View site */}
          <Link
            to="/"
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--glass-bg-strong)]',
              collapsed && 'justify-center px-0'
            )}
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <ChevronRight size={18} />
            {!collapsed && <span>View Site</span>}
          </Link>

          {/* Admin profile */}
          {!collapsed && user && (
            <div
              className="flex items-center gap-2.5 rounded-xl p-2.5"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
              }}
            >
              <Avatar src={user.avatar_url} name={user.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-semibold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {user.full_name || user.username}
                </p>
                <p
                  className="text-[10px]"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Administrator
                </p>
              </div>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                }}
                className="rounded-lg p-1.5 hover:bg-red-500/10"
                style={{
                  color: 'var(--color-error)',
                }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ══════════════════════════════════ */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* ── Top Bar ────────────────────────────────────── */}
        <header
          className="flex h-14 flex-shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6"
          style={{
            backgroundColor: 'var(--glass-bg-strong)',
            backdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)] lg:hidden"
            style={{
              color: 'var(--color-text-secondary)',
            }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <Link
              to="/admin"
              className="font-medium"
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              Admin
            </Link>
            {location.pathname !== '/admin' && (
              <>
                <ChevronRight
                  size={14}
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                />
                <span
                  className="font-semibold capitalize"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {location.pathname.split('/').pop()}
                </span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{
                color: 'var(--color-text-secondary)',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Admin avatar */}
            <Link
              to="/profile"
              className="h-8 w-8 overflow-hidden rounded-xl"
              style={{
                border: '2px solid var(--color-border)',
              }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-500 text-xs font-bold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
