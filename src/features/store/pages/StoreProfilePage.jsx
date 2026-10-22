import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import SEOHead from '@components/seo/SEOHead';
import { buildStoreSchema, buildBreadcrumbSchema } from '@components/seo/structuredData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Star,
  ShoppingBag,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  Flag,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Trash2,
  Clock,
  Phone,
  Mail,
  Globe,
  Navigation,
  Building2,
  ArrowLeft,
  Edit3,
  Plus,
} from 'lucide-react';
import StoreService from '@api/services/store.service';
import AdminService from '@api/services/admin.service';
import ReviewService from '@api/services/review.service';
import FollowerService from '@api/services/follower.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import ProductCard from '@components/cards/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import ReviewCard from '@components/cards/ReviewCard';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import ReportModal from '@components/modals/ReportModal';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import StoreFollowersSection from '@features/store/components/StoreFollowersSection';
import { cn, getErrorMessage, isAdmin } from '@lib/utils';
import { formatCompactNumber, formatRating, formatMemberSince } from '@utils/formatters';
import { DEFAULT_PAGE_SIZE } from '@utils/constants';
import {
  parseStoreMeta,
  getTodayHoursStatus,
  DAYS_OF_WEEK,
  formatTime24To12,
} from '@utils/sellerMeta';
import toast from '@lib/toast';

const STOREFRONT_TABS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'about', label: 'About' },
  { id: 'hours', label: 'Hours' },
  { id: 'reviews', label: 'Reviews' },
];

export default function StoreProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isCurrentAdmin = isAdmin(currentUser?.role);

  const [activeTab, setActiveTab] = useState('inventory');
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAdminDelete, setShowAdminDelete] = useState(false);

  // ── Fetch store ────────────────────────────────────────
  const { data: storeData, isLoading } = useQuery({
    queryKey: queryKeys.stores.bySlug(slug),
    queryFn: () => StoreService.getBySlug(slug),
    enabled: !!slug,
  });

  const store = storeData?.data;
  const owner = store?.users;
  const isOwner = Boolean(currentUser?.id && owner?.id && currentUser.id === owner.id);

  // ── Follow status ──────────────────────────────────────
  const { data: followData } = useQuery({
    queryKey: ['follow-status', store?.id],
    queryFn: () => FollowerService.getStatus(store.id),
    enabled: !!store?.id && isAuthenticated && !isOwner,
  });

  const isFollowing = followData?.data?.is_following || false;

  // ── Follow/unfollow mutation ───────────────────────────
  const followMutation = useMutation({
    mutationFn: () => (isFollowing ? StoreService.unfollow(slug) : StoreService.follow(slug)),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.stores.bySlug(slug),
      });
      qc.invalidateQueries({
        queryKey: ['follow-status', store?.id],
      });
      toast.success(isFollowing ? 'Unfollowed' : 'Following! 🎉');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Products (infinite scroll) ─────────────────────────
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.stores.products(slug),
    queryFn: ({ pageParam = 1 }) =>
      StoreService.getProducts(slug, {
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
      }),
    getNextPageParam: (last) => (last.pagination?.has_next ? last.pagination.page + 1 : undefined),
    enabled: !!slug,
  });

  const products = productsData?.pages.flatMap((p) => p.data) || [];

  // ── Reviews ────────────────────────────────────────────
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: queryKeys.reviews.store(store?.id),
    queryFn: () =>
      ReviewService.getByStore(store.id, {
        page: 1,
        limit: 20,
      }),
    enabled: !!store?.id && activeTab === 'reviews',
  });

  const reviews = reviewsData?.data || [];

  // ── Admin: Verify seller profile ────────────────────────
  const adminVerifyMutation = useMutation({
    mutationFn: () =>
      AdminService.verifyStore(store.id, {
        is_verified: !store.is_verified,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.stores.bySlug(slug),
      });
      toast.success(store.is_verified ? 'Verification removed' : 'Business verified ✅');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

  // ── Admin: Delete seller profile ────────────────────────
  const adminDeleteMutation = useMutation({
    mutationFn: () => StoreService.delete(store.id),
    onSuccess: () => {
      toast.success('Seller profile deleted');
      window.location.href = `${ADMIN_URL}/stores`;
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Share ──────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.share({
        title: store.store_name,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Storefront link copied!');
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not found
  if (!store) {
    return (
      <div className="w-full px-4 sm:px-8 py-12">
        <EmptyState
          icon="🏪"
          title="Storefront not found"
          description="This business profile doesn't exist or has been removed."
          actionLabel="Go Home"
          actionTo="/"
        />
      </div>
    );
  }

  const storeMeta = parseStoreMeta(store);
  const todayHours = getTodayHoursStatus(storeMeta.businessHours);
  const categorySubtitle =
    storeMeta.businessTypeLabel ||
    store.categories?.name ||
    (storeMeta.isBusinessProfile ? 'Business Storefront' : 'Personal Seller');

  const publicAddressLabel =
    storeMeta.hasStorefront &&
    storeMeta.addressVisibility === 'exact' &&
    storeMeta.streetAddress
      ? [storeMeta.streetAddress, store.location_city].filter(Boolean).join(', ')
      : store.location_city || '';

  const phoneNumber = storeMeta.businessPhone || owner?.phone || '';
  const mapsQuery =
    storeMeta.hasStorefront &&
    storeMeta.addressVisibility === 'exact' &&
    storeMeta.streetAddress
      ? `${storeMeta.streetAddress}, ${store.location_city || ''}`
      : store.location_city || store.store_name;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  // ── Primary CTA Handlers (Call / Message / Get Directions) ──
  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      setActiveTab('about');
      toast('Phone number not listed — view contact details in the About tab.', {
        icon: '📞',
      });
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOwner) {
      navigate('/inbox');
      return;
    }
    if (products.length > 0) {
      navigate(`/inbox?product=${products[0].id}`);
    } else {
      navigate('/inbox');
    }
  };

  const handleGetDirections = () => {
    if (mapsQuery) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTab('hours');
    }
  };

  const displayedProducts = showAllInventory ? products : products.slice(0, 10);
  const todayDayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];

  return (
    <>
      <SEOHead
        title={`${store.store_name} — Aliwayz Store`}
        description={
          storeMeta.cleanDescription ||
          `Visit ${store.store_name} on Aliwayz. Browse inventory, check business hours, and connect directly.`
        }
        canonical={`/store/${slug}`}
        ogImage={store.logo_url || store.banner_url}
        ogImageAlt={store.store_name}
        structuredData={[
          buildStoreSchema(store),
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Stores', url: '/marketplace' },
            { name: store.store_name, url: `/store/${slug}` },
          ]),
        ].filter(Boolean)}
      />

      {/* ═══ FULL-WIDTH RESPONSIVE STOREFRONT PAGE ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen pb-24 md:pb-12"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* ── 1. FULL-WIDTH HERO COVER BANNER ───────────────── */}
        <div
          className="relative w-full h-44 sm:h-60 md:h-72 lg:h-80 xl:h-96 overflow-hidden"
          style={{
            background: store.banner_url
              ? undefined
              : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #4F46E5 100%)',
          }}
        >
          {store.banner_url && (
            <img
              src={store.banner_url}
              alt={store.store_name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Top & Bottom subtle gradients for contrast */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

          {/* Floating Top Controls (Full-width responsive padding) */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14 pt-3.5 sm:pt-5">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center transition-colors shadow-sm"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Right Utility & Owner Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && (
                <>
                  <Link
                    to="/my-store/edit"
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Edit3 size={13} />
                    <span>Edit Storefront</span>
                  </Link>
                  <Link
                    to="/sell/create"
                    className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Listing</span>
                  </Link>
                </>
              )}

              {!isOwner && isAuthenticated && !isCurrentAdmin && (
                <button
                  type="button"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isFollowing ? <UserMinus size={13} /> : <UserPlus size={13} />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center transition-colors shadow-sm"
                title="Share Storefront"
              >
                <Share2 size={16} />
              </button>

              {!isOwner && isAuthenticated && !isCurrentAdmin && (
                <button
                  type="button"
                  onClick={() => setShowReport(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Report Storefront"
                >
                  <Flag size={15} />
                </button>
              )}

              {isCurrentAdmin && !isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => adminVerifyMutation.mutate()}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-emerald-400 flex items-center justify-center transition-colors"
                    title={store.is_verified ? 'Remove Verification' : 'Verify Business'}
                  >
                    <ShieldCheck size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminDelete(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-rose-400 flex items-center justify-center transition-colors"
                    title="Delete Storefront"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. FULL-WIDTH OVERLAPPING BUSINESS HEADER ──────── */}
        <div
          className="relative z-10 -mt-6 sm:-mt-8 rounded-t-3xl border-t shadow-sm w-full"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 pt-5 sm:pt-7 pb-5">
            {/* Top section: Responsive Flex on Desktop, Stacked on Mobile */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              {/* Left Column: Avatar + Business Info */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 min-w-0 flex-1">
                {/* Store Logo Badge (overlaps cover banner cleanly) */}
                {store.logo_url && (
                  <div className="-mt-12 sm:-mt-16 w-fit flex-shrink-0">
                    <div
                      className="rounded-2xl p-1.5 shadow-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <Avatar src={store.logo_url} name={store.store_name} size="2xl" />
                    </div>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {/* Business Name + Verified Business Badge */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1
                      className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-words"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {store.store_name}
                    </h1>

                    {(store.is_verified || storeMeta.isBusinessProfile) && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <ShieldCheck size={14} className="flex-shrink-0" />
                        Verified Business
                      </span>
                    )}
                  </div>

                  {/* Category Subtitle */}
                  <p
                    className="text-sm sm:text-base font-medium mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {categorySubtitle}
                  </p>

                  {/* Rating & Reviews + Location Row */}
                  <div className="mt-3 space-y-1.5 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <ShieldCheck
                          size={15}
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        {Number(store.average_rating) > 0 && Number(store.total_reviews) > 0 ? (
                          <>
                            <span
                              className="font-bold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {formatRating(store.average_rating)}
                            </span>
                            <Star
                              size={13}
                              fill="#F59E0B"
                              style={{ color: '#F59E0B' }}
                            />
                            <span>
                              ({formatCompactNumber(store.total_reviews || 0)}{' '}
                              {store.total_reviews === 1 ? 'review' : 'reviews'})
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-xs">
                            🌱 New Seller
                          </span>
                        )}
                        <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </button>

                      {publicAddressLabel && (
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <span className="hidden sm:inline">•</span>
                          <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                          <span>{publicAddressLabel}</span>
                        </span>
                      )}
                    </div>

                    {/* Open Today · Hours Line with Expandable Dropdown */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowHoursDropdown((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      >
                        <Clock
                          size={15}
                          style={{
                            color:
                              todayHours?.isOpen === false ? '#EF4444' : '#10B981',
                          }}
                        />
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              todayHours?.isOpen === false ? '#EF4444' : '#10B981',
                          }}
                        >
                          {todayHours?.isOpen === false ? 'Closed today' : 'Open today'}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          ·{' '}
                          {todayHours?.hoursText && todayHours.hoursText !== 'Closed'
                            ? todayHours.hoursText
                            : '9:00 AM – 6:00 PM'}
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            'transition-transform duration-200',
                            showHoursDropdown && 'rotate-180'
                          )}
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                      </button>

                      <AnimatePresence>
                        {showHoursDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-2 p-3.5 rounded-2xl border max-w-sm space-y-1 text-xs"
                              style={{
                                backgroundColor: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                              }}
                            >
                              {DAYS_OF_WEEK.map((day) => {
                                const info = storeMeta.businessHours?.[day.key];
                                const isClosed = !info || info.closed;
                                const isToday = day.key === todayDayKey;
                                return (
                                  <div
                                    key={day.key}
                                    className={cn(
                                      'flex items-center justify-between py-0.5',
                                      isToday && 'font-bold'
                                    )}
                                    style={{
                                      color: isToday
                                        ? 'var(--color-text-primary)'
                                        : 'var(--color-text-secondary)',
                                    }}
                                  >
                                    <span>{day.label}</span>
                                    <span>
                                      {isClosed
                                        ? 'Closed'
                                        : `${formatTime24To12(info.open)} – ${formatTime24To12(
                                            info.close
                                          )}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right / Bottom Column: 3 Primary Action Buttons (Call | Message | Get Directions) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[440px]">
                <button
                  type="button"
                  onClick={handleCall}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  }}
                >
                  <Phone size={15} className="flex-shrink-0" />
                  <span className="truncate">Call</span>
                </button>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  }}
                >
                  <MessageCircle size={15} className="flex-shrink-0" />
                  <span className="truncate">Message</span>
                </button>

                <button
                  type="button"
                  onClick={handleGetDirections}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  }}
                >
                  <MapPin size={15} className="flex-shrink-0" />
                  <span className="truncate">Get Directions</span>
                </button>
              </div>
            </div>

            {/* Admin Info Bar (only visible to platform admins) */}
            {isCurrentAdmin && !isOwner && (
              <div
                className="mt-4 p-3 rounded-xl border flex flex-wrap items-center gap-2 text-xs"
                style={{
                  borderColor: 'rgba(91,110,245,0.3)',
                  backgroundColor: 'rgba(91,110,245,0.06)',
                }}
              >
                <ShieldCheck size={14} style={{ color: 'var(--color-brand)' }} />
                <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>
                  Admin View
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Owner: @{owner?.username || 'unknown'}
                </span>
                {owner?.username && (
                  <Link
                    to={`/user/${owner.username}`}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    View user profile →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── 3. FULL-WIDTH UNDERLINE TABS (Inventory | About | Hours | Reviews) ── */}
          <div
            className="w-full border-t border-b px-4 sm:px-6 lg:px-10 xl:px-14"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="grid grid-cols-4 max-w-2xl">
              {STOREFRONT_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="relative py-3.5 text-center text-xs sm:text-sm font-bold transition-colors"
                    style={{
                      color: isActive ? '#2563EB' : 'var(--color-text-secondary)',
                    }}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="storefrontActiveTabIndicator"
                        className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] rounded-t-full"
                        style={{ backgroundColor: '#2563EB' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 4. FULL-WIDTH RESPONSIVE TAB CONTENT ───────────── */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8">
          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2
                  className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Our Inventory
                </h2>

                <div className="flex items-center gap-4">
                  {isOwner && (
                    <Link
                      to="/sell/create"
                      className="text-xs sm:text-sm font-semibold hover:underline"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      + Add Listing
                    </Link>
                  )}
                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllInventory(true);
                        if (hasNextPage) fetchNextPage();
                      }}
                      className="text-xs sm:text-sm font-bold hover:underline"
                      style={{ color: '#2563EB' }}
                    >
                      View All
                    </button>
                  )}
                </div>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="No inventory listed yet"
                  description={
                    isOwner
                      ? 'Post your first item, vehicle, or property to showcase it in your storefront.'
                      : "This business hasn't published any active listings yet."
                  }
                  actionLabel={isOwner ? 'Create Listing' : undefined}
                  actionTo={isOwner ? '/sell/create' : undefined}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                    {displayedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} showSeller={false} />
                    ))}
                  </div>

                  {(hasNextPage || (!showAllInventory && products.length > 10)) && (
                    <div className="pt-6 flex justify-center">
                      <Button
                        variant="outline"
                        isLoading={isFetchingNextPage}
                        onClick={() => {
                          if (!showAllInventory) {
                            setShowAllInventory(true);
                          }
                          if (hasNextPage) {
                            fetchNextPage();
                          }
                        }}
                        leftIcon={<ChevronDown size={16} />}
                      >
                        View All Inventory
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Description Card */}
                <div
                  className="lg:col-span-2 rounded-2xl p-5 sm:p-6 border space-y-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <h2
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    About {store.store_name}
                  </h2>
                  <p
                    className="whitespace-pre-line text-sm sm:text-base leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {storeMeta.cleanDescription ||
                      `Welcome to ${store.store_name} on Aliwayz. Browse our active inventory or message us directly with any questions.`}
                  </p>

                  {/* Social Media Links */}
                  {(store.social_instagram ||
                    store.social_facebook ||
                    store.social_tiktok) && (
                    <div
                      className="pt-4 border-t"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <h4
                        className="mb-2.5 text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Social Links
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          store.social_instagram,
                          store.social_facebook,
                          store.social_tiktok,
                        ]
                          .filter(Boolean)
                          .map((url, i) => {
                            let hostname = '';
                            try {
                              hostname = new URL(url).hostname.replace('www.', '');
                            } catch {
                              hostname = url;
                            }
                            return (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer nofollow ugc"
                                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-colors hover:bg-[var(--glass-bg-strong)]"
                                style={{
                                  color: '#2563EB',
                                  borderColor: 'var(--color-border)',
                                }}
                              >
                                <ExternalLink size={12} />
                                {hostname}
                              </a>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Member Since / Owner */}
                  {owner && (
                    <div
                      className="pt-4 border-t flex flex-wrap items-center justify-between gap-3"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <Link
                        to={`/user/${owner.username}`}
                        className="flex items-center gap-3 rounded-xl hover:opacity-85 transition-opacity"
                      >
                        <Avatar src={owner.avatar_url} name={owner.username} size="sm" />
                        <div>
                          <p
                            className="text-xs sm:text-sm font-bold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            Managed by @{owner.username}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {formatMemberSince(store.created_at)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Contact & Storefront Highlights Column */}
                <div className="space-y-5">
                  <div
                    className="rounded-2xl p-5 border space-y-3"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <h3
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Building2 size={15} style={{ color: '#2563EB' }} />
                      Business Details &amp; Contact
                    </h3>

                    <div
                      className="space-y-2.5 text-xs sm:text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <p className="flex items-center gap-2">
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Category:
                        </span>
                        <span>{categorySubtitle}</span>
                      </p>

                      {publicAddressLabel && (
                        <p className="flex items-start gap-2">
                          <MapPin
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: '#2563EB' }}
                          />
                          <span>{publicAddressLabel}</span>
                        </p>
                      )}

                      {phoneNumber && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} style={{ color: '#2563EB' }} />
                          <a href={`tel:${phoneNumber}`} className="hover:underline">
                            {phoneNumber}
                          </a>
                        </p>
                      )}

                      {storeMeta.businessEmail && (
                        <p className="flex items-center gap-2">
                          <Mail size={14} style={{ color: '#2563EB' }} />
                          <a
                            href={`mailto:${storeMeta.businessEmail}`}
                            className="hover:underline"
                          >
                            {storeMeta.businessEmail}
                          </a>
                        </p>
                      )}

                      {storeMeta.websiteUrl && (
                        <p className="flex items-center gap-2">
                          <Globe size={14} style={{ color: '#2563EB' }} />
                          <a
                            href={
                              storeMeta.websiteUrl.startsWith('http')
                                ? storeMeta.websiteUrl
                                : `https://${storeMeta.websiteUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#2563EB' }}
                          >
                            {storeMeta.websiteUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Storefront Stats */}
                  <div
                    className="rounded-2xl p-5 border space-y-3"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <h3
                      className="text-sm font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Storefront Highlights
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: 'Rating',
                          value:
                            Number(store.average_rating) > 0 && Number(store.total_reviews) > 0
                              ? formatRating(store.average_rating)
                              : 'New Seller',
                        },
                        {
                          label: 'Sales',
                          value: formatCompactNumber(store.total_sales || 0),
                        },
                        {
                          label: 'Followers',
                          value: formatCompactNumber(store.total_followers || 0),
                        },
                        {
                          label: 'Reviews',
                          value: formatCompactNumber(store.total_reviews || 0),
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl p-3 text-center border"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <p
                            className="text-base sm:text-lg font-bold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {stat.value}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Followers */}
              <div
                className="rounded-2xl p-5 border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <StoreFollowersSection storeId={store.id} />
              </div>
            </div>
          )}

          {/* TAB: HOURS */}
          {activeTab === 'hours' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Schedule Card */}
              <div
                className="rounded-2xl p-5 sm:p-6 border space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={18} style={{ color: '#2563EB' }} />
                    <h2
                      className="text-base sm:text-lg font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Business Hours
                    </h2>
                  </div>

                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        todayHours?.isOpen === false
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(16, 185, 129, 0.12)',
                      color:
                        todayHours?.isOpen === false ? '#EF4444' : '#10B981',
                    }}
                  >
                    {todayHours?.isOpen === false ? 'Closed Today' : 'Open Today'}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  {DAYS_OF_WEEK.map((day) => {
                    const info = storeMeta.businessHours?.[day.key];
                    const isClosed = !info || info.closed;
                    const isToday = day.key === todayDayKey;
                    return (
                      <div
                        key={day.key}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl',
                          isToday && 'font-bold'
                        )}
                        style={{
                          backgroundColor: isToday
                            ? 'var(--color-bg)'
                            : 'transparent',
                          color: isToday
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        <span>
                          {day.label} {isToday && '(Today)'}
                        </span>
                        <span
                          style={{
                            color: isClosed
                              ? 'var(--color-text-muted)'
                              : isToday
                                ? '#10B981'
                                : 'var(--color-text-primary)',
                          }}
                        >
                          {isClosed
                            ? 'Closed'
                            : `${formatTime24To12(info.open)} – ${formatTime24To12(
                                info.close
                              )}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isOwner && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() =>
                        navigate('/sell/create?mode=business&onboarding=business-edit')
                      }
                    >
                      Edit Business Hours
                    </Button>
                  </div>
                )}
              </div>

              {/* Location & Directions Card */}
              <div
                className="rounded-2xl p-5 sm:p-6 border flex flex-col justify-between space-y-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} style={{ color: '#2563EB' }} />
                    <h3
                      className="text-base sm:text-lg font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Location &amp; Directions
                    </h3>
                  </div>

                  <p
                    className="text-sm sm:text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {publicAddressLabel || 'Local Service Area'}
                  </p>

                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {storeMeta.hasStorefront &&
                    storeMeta.addressVisibility === 'exact' &&
                    storeMeta.streetAddress
                      ? 'Visit our storefront during business hours or click below to open turn-by-turn directions in Google Maps.'
                      : 'Serving customers across this metro area. Message or call us directly to schedule a visit or pickup.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGetDirections}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-95"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  }}
                >
                  <Navigation size={15} />
                  <span>Open in Google Maps</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Customer Reviews
                  </h2>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {Number(store.average_rating) > 0 && Number(store.total_reviews) > 0
                      ? `${formatRating(store.average_rating)} out of 5 · ${
                          store.total_reviews || 0
                        } reviews`
                      : 'No customer reviews yet'}
                  </p>
                </div>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon="⭐"
                  title="No reviews yet"
                  description="Be the first to leave a review after purchasing from this storefront."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ MODALS ═══════════════════════════════════════ */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="store"
        targetId={store?.id}
        targetName={store?.store_name}
      />

      <ConfirmDeleteModal
        isOpen={showAdminDelete}
        onClose={() => setShowAdminDelete(false)}
        onConfirm={() => adminDeleteMutation.mutate()}
        isLoading={adminDeleteMutation.isPending}
        title="Delete this seller profile?"
        description="This will permanently delete this seller profile, all their product listings, images, and associated data."
        itemName={store?.store_name}
        itemType="Seller Profile"
        countdownSeconds={10}
      />
    </>
  );
}
