import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Edit3, MapPin, Calendar, Star, ShoppingBag,
  Heart, Users, Package, Settings, Shield,
  ChevronRight, Store, LayoutDashboard,
  PlusCircle, Compass, Bell, MessageCircle,
  TrendingUp, Eye,
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
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import SellerVerifiedBadge from '@components/common/SellerVerifiedBadge';
import {
  cn,
  isSeller,
  isBuyer,
  isAdmin,
} from '@lib/utils';
import {
  formatMemberSince,
  formatCompactNumber,
  formatRating,
} from '@utils/formatters';
import { getBadgeDisplay } from '@utils/helpers';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { totalUnread } = useChatStore();
  const { unreadCount } = useNotificationStore();

  const role = user?.role || 'buyer';

  const { data: profileData, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => UserService.getMe(),
  });

  const { data: reviewData } = useQuery({
    queryKey: queryKeys.reviews.summary(user?.id),
    queryFn: () => ReviewService.getUserSummary(user?.id),
    enabled: !!user?.id,
  });

  const profile = profileData?.data;
  const stats = profile?.seller_stats;
  const badges = (profile?.user_badges || []).filter(
    (b) => b.is_active
  );
  const reviewSummary = reviewData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile — Aliwayz</title>
      </Helmet>

      <div className="container-app py-4 sm:py-6 max-w-3xl space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* ═══ PROFILE HEADER ═════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" className="overflow-hidden">
            {/* Cover */}
            <div
              className="h-20 sm:h-28 relative"
              style={{
                background: isAdmin(role)
                  ? 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)'
                  : isSeller(role)
                    ? 'linear-gradient(135deg, var(--color-brand) 0%, #8B5CF6 100%)'
                    : isBuyer(role)
                      ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              }}
            >
              <button
                onClick={() =>
                  navigate('/profile/edit')
                }
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all hover:bg-white/30"
                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.2)',
                  color: 'white',
                  border:
                    '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Edit3
                  size={12}
                  className="inline mr-1"
                />
                Edit
              </button>
            </div>

            <div className="px-4 sm:px-6 pb-5">
              {/* Avatar + Role Badge */}
              <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
                <div className="relative">
                  <div
                    className="rounded-2xl overflow-hidden border-4"
                    style={{
                      borderColor:
                        'var(--color-surface)',
                    }}
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      name={
                        profile?.full_name ||
                        profile?.username
                      }
                      size="2xl"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    style={{
                      backgroundColor: isAdmin(
                        role
                      )
                        ? '#7C3AED'
                        : isSeller(role)
                          ? 'var(--color-brand)'
                          : 'var(--color-success)',
                      color: 'white',
                    }}
                  >
                    {isAdmin(role)
                      ? 'Admin'
                      : role}
                  </div>
                </div>
              </div>

              {/* Name */}
              <h1
                className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                style={{
                  color:
                    'var(--color-text-primary)',
                }}
              >
                {profile?.full_name ||
                  profile?.username}
                {profile?.seller_verification_status === 'identity_verified' && (
                  <SellerVerifiedBadge />
                )}
              </h1>
              <p
                className="text-sm"
                style={{
                  color:
                    'var(--color-text-muted)',
                }}
              >
                @{profile?.username}
              </p>

              {/* Bio */}
              {profile?.bio && (
                <p
                  className="text-sm mt-2 max-w-md"
                  style={{
                    color:
                      'var(--color-text-secondary)',
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Meta */}
              <div
                className="flex flex-wrap items-center gap-3 mt-3 text-xs"
                style={{
                  color:
                    'var(--color-text-muted)',
                }}
              >
                {profile?.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {profile.location_city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatMemberSince(
                    profile?.created_at
                  )}
                </span>
                {profile?.email_verified && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor:
                        'rgba(16,185,129,0.1)',
                      color:
                        'var(--color-success)',
                      border:
                        '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    ✉ Verified
                  </span>
                )}
                {profile?.phone_verified && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor:
                        'rgba(6,182,212,0.1)',
                      color:
                        'var(--color-info)',
                      border:
                        '1px solid rgba(6,182,212,0.2)',
                    }}
                  >
                    📱 Verified
                  </span>
                )}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {badges.map((ub) => {
                    const badge = ub.badges;
                    const display = getBadgeDisplay(
                      badge?.code
                    );
                    return (
                      <span
                        key={badge?.code}
                        className={cn(
                          'badge text-[11px]',
                          display.color
                        )}
                      >
                        {display.emoji}{' '}
                        {badge?.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ═══ ADMIN SECTION ══════════════════════════════ */}
        {isAdmin(role) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                    boxShadow:
                      'var(--shadow-brand)',
                  }}
                >
                  <Shield
                    size={22}
                    className="text-white"
                  />
                </div>
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{
                      color:
                        'var(--color-text-primary)',
                    }}
                  >
                    Platform Administrator
                  </h3>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        'var(--color-text-muted)',
                    }}
                  >
                    Full access to platform management
                  </p>
                </div>
              </div>
              <Link to="/admin">
                <Button
                  fullWidth
                  size="lg"
                  leftIcon={
                    <LayoutDashboard size={18} />
                  }
                >
                  Open Admin Panel
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* ═══ BUYER DASHBOARD ════════════════════════════ */}
        {isBuyer(role) && !isAdmin(role) && (
          <BuyerDashboard
            profile={profile}
            reviewSummary={reviewSummary}
            totalUnread={totalUnread}
            unreadCount={unreadCount}
          />
        )}

        {/* ═══ SELLER STATS ═══════════════════════════════ */}
        {isSeller(role) &&
          !isAdmin(role) &&
          stats && (
            <SellerStats
              stats={stats}
              reviewSummary={reviewSummary}
            />
          )}

        {/* ═══ REVIEW SUMMARY ═════════════════════════════ */}
        {!isAdmin(role) &&
          reviewSummary &&
          reviewSummary.total > 0 && (
            <ReviewSummaryCard
              summary={reviewSummary}
            />
          )}

        {/* ═══ QUICK LINKS ════════════════════════════════ */}
        <QuickLinks
          role={role}
          unreadCount={unreadCount}
        />
      </div>
    </>
  );
}

// ── Buyer Dashboard ──────────────────────────────────────
function BuyerDashboard({
  profile,
  reviewSummary,
  totalUnread,
  unreadCount,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Messages',
            value:
              totalUnread > 0
                ? totalUnread
                : '—',
            icon: MessageCircle,
            color: 'var(--color-brand)',
            to: '/inbox',
            badge: totalUnread > 0,
          },
          {
            label: 'Notifications',
            value:
              unreadCount > 0
                ? unreadCount
                : '—',
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
    </div>
  );
}

// ── Seller Stats ─────────────────────────────────────────
function SellerStats({ stats }) {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {[
        {
          label: 'Sales',
          value: formatCompactNumber(
            stats.total_sales
          ),
          icon: ShoppingBag,
          color: 'var(--color-brand)',
        },
        {
          label: 'Rating',
          value:
            stats.average_rating > 0 &&
            stats.total_reviews > 0
              ? formatRating(
                  stats.average_rating
                )
              : 'New',
          icon: Star,
          color:
            stats.average_rating > 0
              ? 'var(--color-warning)'
              : 'var(--color-brand)',
        },
        {
          label: 'Reviews',
          value: formatCompactNumber(
            stats.total_reviews
          ),
          icon: Star,
          color: '#8B5CF6',
        },
        {
          label: 'Followers',
          value: formatCompactNumber(
            stats.total_followers
          ),
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

// ── Stat Card ────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  badge,
}) {
  return (
    <Card className="p-4 text-center relative overflow-hidden hover-lift">
      {badge && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--color-error)',
          }}
        />
      )}
      <Icon
        size={18}
        className="mx-auto mb-2"
        style={{ color }}
      />
      <p
        className="text-xl font-bold"
        style={{
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </p>
      <p
        className="text-xs mt-0.5"
        style={{
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </p>
    </Card>
  );
}

// ── Review Summary Card ──────────────────────────────────
function ReviewSummaryCard({ summary }) {
  return (
    <Card className="p-5">
      <h3
        className="font-semibold text-sm mb-3 flex items-center gap-2"
        style={{
          color: 'var(--color-text-primary)',
        }}
      >
        <Star
          size={16}
          style={{
            color: 'var(--color-warning)',
          }}
        />
        My Reviews ({summary.total})
      </h3>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p
            className="text-3xl font-bold"
            style={{
              color: 'var(--color-warning)',
            }}
          >
            {formatRating(
              summary.average_rating
            )}
          </p>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                fill={
                  s <=
                  Math.round(
                    summary.average_rating
                  )
                    ? 'var(--color-warning)'
                    : 'none'
                }
                style={{
                  color:
                    s <=
                    Math.round(
                      summary.average_rating
                    )
                      ? 'var(--color-warning)'
                      : 'var(--color-text-muted)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((r) => {
            const count =
              summary.rating_breakdown?.[r] ||
              0;
            const pct =
              summary.total > 0
                ? (count / summary.total) * 100
                : 0;
            return (
              <div
                key={r}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="w-3 text-right"
                  style={{
                    color:
                      'var(--color-text-muted)',
                  }}
                >
                  {r}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{
                    backgroundColor:
                      'var(--color-surface-elevated)',
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        'var(--color-warning)',
                      transition:
                        'width 0.5s ease',
                    }}
                  />
                </div>
                <span
                  className="w-4 text-right"
                  style={{
                    color:
                      'var(--color-text-muted)',
                  }}
                >
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

// ── Quick Links ──────────────────────────────────────────
function QuickLinks({ role, unreadCount }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const links = [
    // Buyer — NOT admin
    ...(isBuyer(role) && !isAdmin(role)
      ? [
          {
            to: '/favorites',
            icon: Heart,
            label: 'Favorites',
            color: 'var(--color-error)',
            desc: 'Saved items',
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
          },
          {
            to: '/notifications',
            icon: Bell,
            label: 'Notifications',
            color: 'var(--color-warning)',
            desc: 'Alerts & updates',
            badgeCount: unreadCount,
          },
        ]
      : []),

    // Seller — NOT admin
    ...(isSeller(role) && !isAdmin(role)
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
            icon: TrendingUp,
            label: 'Performance',
            color: 'var(--color-info)',
            desc: 'Sales & analytics',
          },
          {
            to: '/my-store/edit',
            icon: Settings,
            label: 'Seller Settings',
            color: 'var(--color-warning)',
            desc: 'Edit your profile',
          },
        ]
      : []),

    // Admin — only admin panel
    ...(isAdmin(role)
      ? [
          {
            to: '/admin',
            icon: LayoutDashboard,
            label: 'Admin Dashboard',
            color: 'var(--color-brand)',
            desc: 'Platform overview',
          },
          {
            to: '/admin/users',
            icon: Users,
            label: 'Manage Users',
            color: '#8B5CF6',
            desc: 'View & moderate users',
          },
          {
            to: '/admin/stores',
            icon: Store,
            label: 'Manage Stores',
            color: 'var(--color-info)',
            desc: 'Verify & moderate stores',
          },
          {
            to: '/admin/products',
            icon: Package,
            label: 'Manage Listings',
            color: 'var(--color-success)',
            desc: 'Feature & moderate listings',
          },
          {
            to: '/admin/reports',
            icon: Shield,
            label: 'Reports',
            color: 'var(--color-error)',
            desc: 'Review user reports',
          },
          {
            to: '/admin/feedback',
            icon: MessageCircle,
            label: 'User Feedback',
            color: 'var(--color-warning)',
            desc: 'Site feedback & reviews',
          },
          {
            to: '/admin/broadcast',
            icon: Bell,
            label: 'Broadcast',
            color: '#06B6D4',
            desc: 'Send notifications',
          },
          {
            to: '/admin/logs',
            icon: Eye,
            label: 'Activity Logs',
            color: 'var(--color-text-muted)',
            desc: 'Moderation history',
          },
        ]
      : []),

    // Common — everyone
    {
      to: '/profile/edit',
      icon: Edit3,
      label: 'Edit Profile',
      color: 'var(--color-text-secondary)',
      desc: 'Update your info',
    },
  ];

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3
        className="text-sm font-semibold px-1"
        style={{
          color: 'var(--color-text-muted)',
        }}
      >
        {isAdmin(role)
          ? 'Admin Quick Access'
          : 'Quick Access'}
      </h3>

      <div className="space-y-1">
        {links.map(
          ({
            to,
            icon: Icon,
            label,
            color,
            desc,
            badge,
            badgeCount,
          }) => (
            <Link
              key={`${to}-${label}`}
              to={to}
              className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[var(--glass-bg-strong)] group"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${color}15`,
                  color,
                }}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{
                    color:
                      'var(--color-text-primary)',
                  }}
                >
                  {label}
                </p>
                {desc && (
                  <p
                    className="text-xs"
                    style={{
                      color:
                        'var(--color-text-muted)',
                    }}
                  >
                    {desc}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {badgeCount > 0 && (
                  <span
                    className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      backgroundColor:
                        'var(--color-error)',
                      color: 'white',
                    }}
                  >
                    {badgeCount > 99
                      ? '99+'
                      : badgeCount}
                  </span>
                )}
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{
                    color:
                      'var(--color-text-muted)',
                  }}
                />
              </div>
            </Link>
          )
        )}
      </div>
    </motion.div>
  );
}