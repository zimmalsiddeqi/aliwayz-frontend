import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Bell,
  Menu,
  X,
  LogOut,
  Store,
  Settings,
  Heart,
  ShoppingBag,
  LayoutDashboard,
  Package,
  Compass,
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@store/auth.store';
import useChatStore from '@store/chat.store';
import useNotificationStore from '@store/notification.store';
import useUIStore from '@store/ui.store';
import Avatar from '@components/ui/Avatar';
import { cn, isSeller, isBuyer, isAdmin } from '@lib/utils';
import LocationSelector from './LocationSelector';
import CategoryDrawer from './CategoryDrawer';
import useOnClickOutside from '@hooks/useOnClickOutside';

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { totalUnread } = useChatStore();
  const { unreadCount } = useNotificationStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  useOnClickOutside(profileMenuRef, () => setMenuOpen(false));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  const role = user?.role || 'guest';
  const isDark = theme === 'dark';

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    setCategoryDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // ── Bottom nav items (mobile) ──────────────────────────
  const getBottomNavItems = () => {
    const items = [];

    // Sell button — NOT for admin
    if (isAuthenticated && isSeller(role) && role !== 'admin') {
      items.push({ to: '/sell/create', icon: PlusCircle, label: 'Sell', highlight: true });
    }

    if (isAuthenticated) {
      items.push({ to: '/inbox', icon: MessageCircle, label: 'Inbox', badge: totalUnread });
    }

    // Admin gets admin panel instead of profile in bottom nav
    if (isAuthenticated && isAdmin(role)) {
      items.push({ to: '/admin', icon: Settings, label: 'Admin' });
    } else {
      items.push({
        to: isAuthenticated ? '/profile' : '/login',
        icon: User,
        label: isAuthenticated ? 'Profile' : 'Login',
      });
    }

    return items;
  };

  // ── Desktop nav items ──────────────────────────────────
  const getDesktopNavItems = () => {
    const items = [];

    // Sell — for sellers and both ONLY, NOT admin
    if (isAuthenticated && isSeller(role) && role !== 'admin') {
      items.push({ to: '/sell/create', icon: PlusCircle, label: 'Sell' });
    }

    if (isAuthenticated) {
      items.push({ to: '/inbox', icon: MessageCircle, label: 'Inbox', badge: totalUnread });
    }

    return items;
  };

  // ── Mobile menu items ──────────────────────────────────
  const getMobileMenuSections = () => {
    const sections = [];

    if (isAuthenticated) {
      // Profile section
      sections.push({
        title: 'Account',
        items: [
          { to: '/profile', icon: User, label: 'My Profile' },
          { to: '/profile/edit', icon: Settings, label: 'Settings' },
        ],
      });

      // Buyer section — NOT for admin
      if (isBuyer(role) && role !== 'admin') {
        sections.push({
          title: 'Shopping',
          items: [
            { to: '/favorites', icon: Heart, label: 'Favorites' },
            { to: '/purchases', icon: ShoppingBag, label: 'Purchases' },
            { to: '/following', icon: Store, label: 'Following' },
            { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
          ],
        });
      }

      // Seller section — NOT for admin
      if (isSeller(role) && role !== 'admin') {
        sections.push({
          title: 'Selling',
          items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Seller Dashboard' },
            { to: '/sell/my-listings', icon: Package, label: 'My Listings' },
            { to: '/sell/create', icon: PlusCircle, label: 'New Listing' },
            { to: '/my-store/analytics', icon: Store, label: 'Performance' },
            { to: '/my-store/edit', icon: Settings, label: 'Seller Settings' },
          ],
        });
      }

      // Browse
      sections.push({
        title: 'Browse',
        items: [
          { to: '/essentials', icon: Compass, label: '🛒 Marketplace' },
          { to: '/vehicles', icon: Compass, label: '🚗 Automotive' },
          { to: '/real-estate', icon: Compass, label: '🏠 Real Estate' },
          { to: '/marketplace', icon: Compass, label: 'All Listings' },
          { to: '/faq', icon: HelpCircle, label: 'FAQ & Help' },
        ],
      });

      // Admin
      if (isAdmin(role)) {
        sections.push({
          title: 'Administration',
          items: [
            { to: '/admin', icon: Settings, label: 'Admin Panel' },
          ],
        });
      }
    }

    return sections;
  };

  const getDesktopDropdownSections = () => {
    const sections = getMobileMenuSections();
    return sections.map(sec => {
      if (sec.title === 'Browse') {
        return {
          ...sec,
          items: sec.items.filter(item => 
            !['/essentials', '/vehicles', '/real-estate'].includes(item.to)
          )
        };
      }
      return sec;
    });
  };

  const bottomNavItems = getBottomNavItems();
  const desktopNavItems = getDesktopNavItems();
  const menuSections = getMobileMenuSections();
  const desktopDropdownSections = getDesktopDropdownSections();

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          TOP NAVBAR — Desktop + Mobile Header
      ═══════════════════════════════════════════════════ */}
      <header
        className="fixed left-0 right-0 top-0 z-50 h-14 sm:h-16"
        style={{
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-app flex h-full items-center justify-between gap-2 sm:gap-4">
          {/* ── Left: Categories Menu Icon + Logo ───────────── */}
          <div className="flex items-center gap-2">
            {/* Leftmost: Categories menu button (Hamburger Menu Icon) */}
            <button
              onClick={() => setCategoryDrawerOpen(true)}
              className="rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Browse categories"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                  boxShadow: '0 0 12px var(--color-brand-glow)',
                }}
              >
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <span className="text-gradient-brand hidden text-base font-bold sm:block sm:text-lg">
                Aliwayz
              </span>
            </Link>
          </div>

          {/* ── Center: Desktop Nav ───────────────────────── */}
          <nav className="hidden items-center gap-1 md:flex">
            {desktopNavItems.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={`desktop-${to}`}
                to={to}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                  location.pathname === to
                    ? 'text-[var(--color-brand)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <Icon size={18} />
                <span className="hidden lg:inline">{label}</span>
                {badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right: Actions ────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:block">
              <LocationSelector compact />
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth buttons or Avatar */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="Log in"
              >
                <User size={18} />
              </Link>
            ) : (
              /* Desktop avatar dropdown trigger */
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  'hidden h-9 w-9 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:flex'
                )}
                style={{
                  borderColor: menuOpen ? 'var(--color-brand)' : 'var(--color-border)',
                  boxShadow: menuOpen ? 'var(--shadow-input)' : undefined,
                }}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-500 text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Desktop Dropdown Menu ────────────────────────── */}
        <AnimatePresence>
          {menuOpen && isAuthenticated && (
            <div ref={profileMenuRef}>
              <motion.div
                className="absolute right-4 top-[52px] z-50 w-72 overflow-hidden rounded-2xl sm:top-[60px]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-xl)',
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* User header */}
                <div className="p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.avatar_url} name={user?.username} size="md" />
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {user?.full_name || user?.username}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        @{user?.username} · {role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                {/* Menu items */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {desktopDropdownSections.map((section, sIdx) => (
                    <div key={sIdx} className="mb-2">
                      <p
                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {section.title}
                      </p>
                      {section.items.map(({ to, icon: Icon, label, badge }) => (
                        <Link
                          key={`dd-${to}-${label}`}
                          to={to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <Icon size={16} />
                          <span className="flex-1">{label}</span>
                          {badge > 0 && (
                            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
                              {badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="divider" />

                {/* Logout */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      useAuthStore.getState().logout();
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════════════════
          MOBILE SIDE DRAWER MENU
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 top-0 z-[70] w-[280px] max-w-[80vw] overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-xl)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                    }}
                  >
                    <span className="text-sm font-bold text-white">A</span>
                  </div>
                  <span className="text-gradient-brand text-base font-bold">Aliwayz</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* User info */}
              {isAuthenticated && user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--glass-bg-strong)]"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <Avatar src={user.avatar_url} name={user.username} size="md" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {user.full_name || user.username}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      @{user.username}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </Link>
              )}

              {/* Menu sections */}
              <div className="space-y-4 p-3">
                {menuSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <p
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map(({ to, icon: Icon, label, badge }) => (
                        <Link
                          key={`mobile-${to}-${label}`}
                          to={to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            location.pathname === to
                              ? 'text-white'
                              : 'hover:bg-[var(--glass-bg-strong)]'
                          )}
                          style={
                            location.pathname === to
                              ? {
                                  background:
                                    'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                  boxShadow: 'var(--shadow-brand)',
                                  color: 'white',
                                }
                              : { color: 'var(--color-text-secondary)' }
                          }
                        >
                          <Icon size={18} />
                          <span className="flex-1">{label}</span>
                          {badge > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-red px-1.5 text-[10px] font-bold text-white">
                              {badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Theme toggle */}
                <div className="px-3 pt-2">
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-[var(--glass-bg-strong)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

                {/* Logout */}
                {isAuthenticated && (
                  <div className="px-3 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        useAuthStore.getState().logout();
                        navigate('/login');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-red-500/10"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <LogOut size={18} />
                      Log out
                    </button>
                  </div>
                )}

                {/* Not logged in — show auth buttons */}
                {!isAuthenticated && (
                  <div className="space-y-2 px-3 pt-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary block w-full py-2.5 text-center text-sm"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-brand block w-full py-2.5 text-center text-sm"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom padding for safe area */}
              <div className="h-20" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ═══════════════════════════════════════════════════ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex h-14 items-center justify-around px-1">
          {bottomNavItems.map(({ to, icon: Icon, label, badge, highlight }) => {
            const isActive = location.pathname === to;

            return (
              <Link
                key={`bottom-${to}-${label}`}
                to={to}
                className={cn(
                  'relative flex min-w-[3rem] flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-all duration-200',
                  highlight && 'mx-0.5'
                )}
                style={{
                  color: isActive ? 'var(--color-brand)' : 'var(--color-text-muted)',
                }}
              >
                {/* Highlight button (Sell) */}
                {highlight ? (
                  <div
                    className="-mt-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                      boxShadow: '0 4px 15px var(--color-brand-glow)',
                    }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                ) : (
                  <Icon size={20} />
                )}

                <span className={cn('text-[10px] font-medium leading-none', highlight && 'mt-0.5')}>
                  {label}
                </span>

                {/* Badge */}
                {badge > 0 && (
                  <span className="absolute -top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}

                {/* Active indicator dot */}
                {isActive && !highlight && (
                  <motion.div
                    className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                    layoutId="bottom-nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Categories sliding drawer */}
      <CategoryDrawer
        isOpen={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
      />

      {/* ── Spacers ────────────────────────────────────────── */}
      {/* Top spacer — prevents content from hiding behind fixed navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
}