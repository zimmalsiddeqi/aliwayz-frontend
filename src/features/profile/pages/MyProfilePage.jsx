import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Edit3,
  MapPin,
  Calendar,
  Star,
  ShoppingBag,
  Heart,
  Users,
  Package,
  Settings,
  Shield,
  ChevronRight,
  Store,
  LayoutDashboard,
  PlusCircle,
  Compass,
  Bell,
  MessageCircle,
  TrendingUp,
  Eye,
  QrCode,
} from 'lucide-react';
import UserService from '@api/services/user.service';
import ReviewService from '@api/services/review.service';
import BadgeService from '@api/services/badge.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useChatStore from '@store/chat.store';
import useNotificationStore from '@store/notification.store';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import { cn, isSeller, isBuyer, isAdmin } from '@lib/utils';
import { formatMemberSince, formatCompactNumber, formatRating } from '@utils/formatters';
import { getBadgeDisplay } from '@utils/helpers';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { totalUnread } = useChatStore();
  const { unreadCount } = useNotificationStore();

  const { data: profileData, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => UserService.getMe(),
  });

  const { data: reviewData } = useQuery({
    queryKey: queryKeys.reviews.summary(user?.id),
    queryFn: () => ReviewService.getUserSummary(user?.id),
    enabled: !!user?.id,
  });

  const { data: badgesData } = useQuery({
    queryKey: queryKeys.badges.user(user?.id),
    queryFn: () => BadgeService.getUserBadges(user?.id),
    enabled: !!user?.id,
  });

  const profile = profileData?.data;
  const stats = profile?.seller_stats;
  const badges = (profile?.user_badges || []).filter((b) => b.is_active);
  const reviewSummary = reviewData?.data;
  const role = user?.role || 'buyer';

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile — Aliwayz</title>
      </Helmet>

      <div className="container-app max-w-3xl space-y-4 py-4 pb-24 sm:space-y-6 sm:py-6 md:pb-8">
        {/* ═══ PROFILE HEADER CARD ════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glass" className="overflow-hidden">
            {/* Cover gradient */}
            <div
              className="relative h-20 sm:h-28"
              style={{
                background: isSeller(role)
                  ? 'linear-gradient(135deg, var(--color-brand) 0%, #8B5CF6 100%)'
                  : isBuyer(role)
                    ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              }}
            >
              {/* Edit button top-right */}
              <button
                onClick={() => navigate('/profile/edit')}
                className="absolute right-3 top-3 rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all hover:bg-white/30"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Edit3 size={12} className="mr-1 inline" />
                Edit
              </button>
            </div>

            <div className="px-4 pb-5 sm:px-6">
              {/* Avatar */}
              <div className="-mt-10 mb-3 flex items-end justify-between sm:-mt-12">
                <div className="relative">
                  <div
                    className="overflow-hidden rounded-2xl border-4"
                    style={{ borderColor: 'var(--color-surface)' }}
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      name={profile?.full_name || profile?.username}
                      size="2xl"
                    />
                  </div>
                  {/* Role badge */}
                  <div
                    className="absolute -bottom-1.5 -right-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                    style={{
                      backgroundColor: isSeller(role)
                        ? 'var(--color-brand)'
                        : isBuyer(role)
                          ? 'var(--color-success)'
                          : '#F59E0B',
                      color: 'white',
                    }}
                  >
                    {role}
                  </div>
                </div>
              </div>

              {/* Name + username */}
              <h1
                className="text-xl font-bold sm:text-2xl"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {profile?.full_name || profile?.username}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                @{profile?.username}
              </p>

              {/* Bio */}
              {profile?.bio && (
                <p
                  className="mt-2 max-w-md text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Meta info */}
              <div
                className="mt-3 flex flex-wrap items-center gap-3 text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {profile?.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {profile.location_city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatMemberSince(profile?.created_at)}
                </span>
                {profile?.email_verified && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      color: 'var(--color-success)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    ✉ Verified
                  </span>
                )}
                {profile?.phone_verified && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'rgba(6,182,212,0.1)',
                      color: 'var(--color-info)',
                      border: '1px solid rgba(6,182,212,0.2)',
                    }}
                  >
                    📱 Verified
                  </span>
                )}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {badges.map((ub) => {
                    const badge = ub.badges;
                    const display = getBadgeDisplay(badge?.code);
                    return (
                      <span key={badge?.code} className={cn('badge text-[11px]', display.color)}>
                        {display.emoji} {badge?.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ═══ BUYER DASHBOARD ════════════════════════════ */}
        {isBuyer(role) && !isSeller(role) && (
          <BuyerDashboard
            profile={profile}
            reviewSummary={reviewSummary}
            totalUnread={totalUnread}
            unreadCount={unreadCount}
          />
        )}

        {/* ═══ SELLER STATS (if seller or both) ══════════ */}
        {isSeller(role) && stats && <SellerStats stats={stats} reviewSummary={reviewSummary} />}

        {/* ═══ QUICK LINKS ════════════════════════════════ */}
        <QuickLinks role={role} unreadCount={unreadCount} />
      </div>
    </>
  );
}

// ── Buyer Dashboard ──────────────────────────────────────────
function BuyerDashboard({ profile, reviewSummary, totalUnread, unreadCount }) {
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Messages',
            value: totalUnread > 0 ? totalUnread : '—',
            icon: MessageCircle,
            color: 'var(--color-brand)',
            to: '/inbox',
            badge: totalUnread > 0,
          },
          {
            label: 'Notifications',
            value: unreadCount > 0 ? unreadCount : '—',
            icon: Bell,
            color: '#F59E0B',
            to: '/notifications',
            badge: unreadCount > 0,
          },
          {
            label: 'Purchases',
            value: '—',
            icon: ShoppingBag,
            color: 'var(--color-success)',
            to: '/purchases',
          },
          {
            label: 'Reviews',
            value: reviewSummary?.total || 0,
            icon: Star,
            color: 'var(--color-warning)',
            to: null,
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            {item.to ? (
              <Link to={item.to} className="block">
                <StatCard {...item} />
              </Link>
            ) : (
              <StatCard {...item} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Review summary if has reviews */}
      {reviewSummary && reviewSummary.total > 0 && <ReviewSummaryCard summary={reviewSummary} />}
    </div>
  );
}

// ── Seller Stats ─────────────────────────────────────────────
function SellerStats({ stats, reviewSummary }) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {[
        {
          label: 'Sales',
          value: formatCompactNumber(stats.total_sales),
          icon: ShoppingBag,
          color: 'var(--color-brand)',
        },
        {
          label: 'Rating',
          value: formatRating(stats.average_rating),
          icon: Star,
          color: 'var(--color-warning)',
        },
        {
          label: 'Reviews',
          value: formatCompactNumber(stats.total_reviews),
          icon: Star,
          color: '#8B5CF6',
        },
        {
          label: 'Followers',
          value: formatCompactNumber(stats.total_followers),
          icon: Users,
          color: 'var(--color-info)',
        },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <StatCard {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, badge }) {
  return (
    <Card className="hover-lift relative overflow-hidden p-4 text-center">
      {badge && (
        <span
          className="absolute right-2 top-2 h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--color-error)' }}
        />
      )}
      <Icon size={18} className="mx-auto mb-2" style={{ color }} />
      <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
    </Card>
  );
}

// ── Review Summary Card ──────────────────────────────────────
function ReviewSummaryCard({ summary }) {
  return (
    <Card className="p-5">
      <h3
        className="mb-3 flex items-center gap-2 text-sm font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <Star size={16} style={{ color: 'var(--color-warning)' }} />
        My Reviews ({summary.total})
      </h3>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>
            {formatRating(summary.average_rating)}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                fill={s <= Math.round(summary.average_rating) ? 'var(--color-warning)' : 'none'}
                style={{
                  color:
                    s <= Math.round(summary.average_rating)
                      ? 'var(--color-warning)'
                      : 'var(--color-text-muted)',
                }}
              />
            ))}
          </div>
          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            as a buyer
          </p>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((r) => {
            const count = summary.rating_breakdown?.[r] || 0;
            const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right" style={{ color: 'var(--color-text-muted)' }}>
                  {r}
                </span>
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: 'var(--color-warning)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span className="w-4 text-right" style={{ color: 'var(--color-text-muted)' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ── Quick Links ──────────────────────────────────────────────
function QuickLinks({ role, unreadCount }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const buyerLinks = [
    {
      to: '/favorites',
      icon: Heart,
      label: 'Favorites',
      color: 'var(--color-error)',
      desc: 'Saved products',
    },
    {
      to: '/purchases',
      icon: ShoppingBag,
      label: 'Purchases',
      color: 'var(--color-brand)',
      desc: 'Order history',
    },
    {
      to: '/following',
      icon: Store,
      label: 'Following',
      color: 'var(--color-info)',
      desc: 'Stores you follow',
    },
    {
      to: '/inbox',
      icon: MessageCircle,
      label: 'Messages',
      color: '#8B5CF6',
      desc: 'Your conversations',
      badge: true,
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Notifications',
      color: 'var(--color-warning)',
      desc: 'Alerts & updates',
      badgeCount: unreadCount,
    },
  ];

  const sellerLinks = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Seller Dashboard',
      color: 'var(--color-brand)',
      desc: 'Manage your store',
    },
    {
      to: '/sell/my-listings',
      icon: Package,
      label: 'My Listings',
      color: '#8B5CF6',
      desc: 'Your products',
    },
    {
      to: '/sell/create',
      icon: PlusCircle,
      label: 'New Listing',
      color: 'var(--color-success)',
      desc: 'Add a new product',
    },
    {
      to: '/my-store/analytics',
      icon: TrendingUp,
      label: 'Analytics',
      color: 'var(--color-info)',
      desc: 'Performance metrics',
    },
    {
      to: '/my-store/edit',
      icon: Settings,
      label: 'Store Settings',
      color: 'var(--color-warning)',
      desc: 'Edit your store',
    },
  ];

  const commonLinks = [
    {
      to: '/profile/edit',
      icon: Edit3,
      label: 'Edit Profile',
      color: 'var(--color-text-secondary)',
      desc: 'Update your info',
    },
  ];

  const links = [
    ...(isBuyer(role) ? buyerLinks : []),
    ...(isSeller(user?.role)
      ? [
          {
            to: '/dashboard',
            icon: LayoutDashboard,
            label: 'Seller Dashboard',
            color: 'var(--color-brand)',
            desc: 'Manage your listings',
          },
          {
            to: '/sell/my-listings',
            icon: Package,
            label: 'My Listings',
            color: '#8B5CF6',
            desc: 'Your active listings',
          },
          {
            to: '/sell/create',
            icon: PlusCircle,
            label: 'New Listing',
            color: 'var(--color-success)',
            desc: 'List something for sale',
          },
          {
            to: '/my-store/analytics',
            icon: Shield,
            label: 'Performance',
            color: 'var(--color-info)',
            desc: 'Sales & analytics',
          },
          {
            to: '/my-store/edit',
            icon: Store,
            label: 'Seller Settings',
            color: 'var(--color-warning)',
            desc: 'Edit your profile',
          },
        ]
      : []),
    ...commonLinks,
  ];

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="px-1 text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        Quick Access
      </h3>

      <div className="space-y-1">
        {links.map(({ to, icon: Icon, label, color, desc, badge, badgeCount }) => (
          <Link
            key={`${to}-${label}`}
            to={to}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-[var(--glass-bg-strong)] sm:px-4"
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-10 sm:w-10"
              style={{ backgroundColor: `${color}15`, color }}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {label}
              </p>
              {desc && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {desc}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {(badge || badgeCount > 0) && badgeCount > 0 && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                  style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
              <ChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
