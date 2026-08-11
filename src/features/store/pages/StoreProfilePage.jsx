import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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
import BadgeUI from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import PageHeader from '@components/common/PageHeader';
import ReportModal from '@components/modals/ReportModal';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import StoreFollowersSection from '@features/store/components/StoreFollowersSection';
import { cn, getErrorMessage, isAdmin } from '@lib/utils';
import { formatCompactNumber, formatRating, formatMemberSince } from '@utils/formatters';
import { DEFAULT_PAGE_SIZE } from '@utils/constants';
import toast from '@lib/toast';

export default function StoreProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isCurrentAdmin = isAdmin(currentUser?.role);

  const [activeTab, setActiveTab] = useState('products');
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
  const isOwner = currentUser?.id === owner?.id;

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
        limit: 10,
      }),
    enabled: !!store?.id && activeTab === 'reviews',
  });

  const reviews = reviewsData?.data || [];

  // ── Admin: Verify store ────────────────────────────────
  const adminVerifyMutation = useMutation({
    mutationFn: () =>
      AdminService.verifyStore(store.id, {
        is_verified: !store.is_verified,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.stores.bySlug(slug),
      });
      toast.success(store.is_verified ? 'Verification removed' : 'Store verified ✅');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Admin: Delete store ────────────────────────────────
  const adminDeleteMutation = useMutation({
    mutationFn: () => StoreService.delete(store.id),
    onSuccess: () => {
      toast.success('Store deleted');
      navigate('/admin/stores');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Admin: Message seller ──────────────────────────────
  const handleAdminMessage = () => {
    if (products.length > 0) {
      navigate(`/inbox?product=${products[0].id}`);
    } else {
      toast('This store has no products. Cannot start a conversation without a product.', {
        icon: '💬',
        duration: 4000,
      });
    }
  };

  // ── Share ──────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.share({
        title: store.store_name,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
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
      <div className="container-app py-12">
        <EmptyState
          icon="🏪"
          title="Store not found"
          description="This store doesn't exist or has been removed."
          actionLabel="Go Home"
          actionTo="/"
        />
      </div>
    );
  }

  const TABS = ['products', 'reviews', 'followers', 'about'];

  return (
    <>
      <Helmet>
        <title>{store.store_name} — Aliwayz</title>
      </Helmet>

      <div className="pb-24 md:pb-10">
        {/* ═══ BANNER ═════════════════════════════════════ */}
        <div
          className="relative h-32 sm:h-48 lg:h-56"
          style={{
            background: store.banner_url
              ? `url(${store.banner_url}) center/cover`
              : 'linear-gradient(135deg, var(--color-brand) 0%, #8B5CF6 50%, #EC4899 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
        </div>

        <div className="container-app relative z-10 -mt-16 space-y-5">
          {/* ═══ STORE HEADER ═════════════════════════════ */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Store avatar */}
            <div
              className="flex-shrink-0 overflow-hidden rounded-2xl border-4"
              style={{
                borderColor: 'var(--color-bg)',
              }}
            >
              <Avatar src={store.logo_url} name={store.store_name} size="2xl" />
            </div>

            {/* Store info */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1
                  className="truncate text-xl font-bold sm:text-2xl"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {store.store_name}
                </h1>
                {store.is_verified && <span title="Verified Store">✅</span>}
              </div>

              {store.description && (
                <p
                  className="mt-1 line-clamp-2 max-w-lg text-sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {store.description}
                </p>
              )}

              {/* Meta stats */}
              <div
                className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:justify-start"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                {store.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {store.location_city}
                  </span>
                )}
                {store.average_rating > 0 && store.total_reviews > 0 ? (
                  <span className="flex items-center gap-1">
                    <Star
                      size={12}
                      fill="var(--color-warning)"
                      style={{ color: 'var(--color-warning)' }}
                    />
                    {formatRating(store.average_rating)} ({formatCompactNumber(store.total_reviews)}
                    )
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'rgba(91,110,245,0.1)',
                      color: 'var(--color-brand)',
                      border: '1px solid rgba(91,110,245,0.2)',
                    }}
                  >
                    🌱 New Seller
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ShoppingBag size={12} />
                  {formatCompactNumber(store.total_sales)} sales
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {formatCompactNumber(store.total_followers)} followers
                </span>
              </div>
            </div>

            {/* ── ACTION BUTTONS ─────────────────────────── */}
            <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-2">
              {/* Follow/Unfollow — for non-owners, non-admins */}
              {!isOwner && isAuthenticated && !isCurrentAdmin && (
                <Button
                  variant={isFollowing ? 'outline' : 'brand'}
                  size="md"
                  isLoading={followMutation.isPending}
                  leftIcon={isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                  onClick={() => followMutation.mutate()}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}

              {/* Share */}
              <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                <Share2 size={16} />
              </Button>

              {/* Report — for non-owners */}
              {!isOwner && isAuthenticated && !isCurrentAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowReport(true)}
                  title="Report store"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <Flag size={16} />
                </Button>
              )}

              {/* ── ADMIN ACTIONS ────────────────────────── */}
              {isCurrentAdmin && !isOwner && (
                <>
                  {/* Verify toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adminVerifyMutation.mutate()}
                    isLoading={adminVerifyMutation.isPending}
                    title={store.is_verified ? 'Remove verification' : 'Verify store'}
                    style={{
                      color: store.is_verified ? 'var(--color-warning)' : 'var(--color-success)',
                    }}
                  >
                    <ShieldCheck size={16} />
                  </Button>

                  {/* Message seller */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAdminMessage}
                    title="Message seller"
                    style={{
                      color: 'var(--color-brand)',
                    }}
                  >
                    <MessageCircle size={16} />
                  </Button>

                  {/* Delete store */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAdminDelete(true)}
                    title="Delete store"
                    style={{
                      color: 'var(--color-error)',
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ═══ ADMIN INFO BAR ═══════════════════════════ */}
          {isCurrentAdmin && !isOwner && (
            <Card
              className="p-3"
              style={{
                borderColor: 'rgba(91,110,245,0.3)',
                backgroundColor: 'rgba(91,110,245,0.05)',
              }}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <ShieldCheck
                  size={14}
                  style={{
                    color: 'var(--color-brand)',
                  }}
                />
                <span
                  className="font-semibold"
                  style={{
                    color: 'var(--color-brand)',
                  }}
                >
                  Admin View
                </span>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Owner: @{owner?.username || 'unknown'}
                </span>
                {owner?.id && (
                  <Link
                    to={`/user/${owner.username}`}
                    className="font-medium hover:underline"
                    style={{
                      color: 'var(--color-brand)',
                    }}
                  >
                    View profile →
                  </Link>
                )}
              </div>
            </Card>
          )}

          {/* ═══ TABS ═════════════════════════════════════ */}
          <div
            className="flex gap-1 overflow-x-auto rounded-xl p-1"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'min-w-[80px] flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all duration-200'
                )}
                style={{
                  backgroundColor: activeTab === tab ? 'var(--color-brand)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ═══ TAB CONTENT ══════════════════════════════ */}

          {/* ── Products ──────────────────────────────────── */}
          {activeTab === 'products' &&
            (productsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No products yet"
                description="This store hasn't listed any products."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} showSeller={false} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      isLoading={isFetchingNextPage}
                      onClick={() => fetchNextPage()}
                      leftIcon={<ChevronDown size={16} />}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            ))}

          {/* ── Reviews ───────────────────────────────────── */}
          {activeTab === 'reviews' &&
            (reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon="⭐"
                title="No reviews yet"
                description="Be the first to leave a review after purchasing."
              />
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ))}

          {/* ── Followers ─────────────────────────────────── */}
          {activeTab === 'followers' && <StoreFollowersSection storeId={store.id} />}

          {/* ── About ─────────────────────────────────────── */}
          {activeTab === 'about' && (
            <Card className="space-y-5 p-5">
              {/* Description */}
              {store.description && (
                <div>
                  <h4
                    className="mb-1.5 text-sm font-semibold"
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    About
                  </h4>
                  <p
                    className="whitespace-pre-line text-sm leading-relaxed"
                    style={{
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {store.description}
                  </p>
                </div>
              )}

              {/* Member since */}
              {owner && (
                <div>
                  <h4
                    className="mb-1.5 text-sm font-semibold"
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Store Owner
                  </h4>
                  <Link
                    to={`/user/${owner.username}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--glass-bg-strong)]"
                    style={{
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Avatar src={owner.avatar_url} name={owner.username} size="sm" />
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        @{owner.username}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {formatMemberSince(store.created_at)}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Social links */}
              {(store.social_instagram || store.social_facebook || store.social_tiktok) && (
                <div>
                  <h4
                    className="mb-2 text-sm font-semibold"
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Social Media
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[store.social_instagram, store.social_facebook, store.social_tiktok]
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
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-[var(--glass-bg-strong)]"
                            style={{
                              color: 'var(--color-brand)',
                              border: '1px solid var(--color-border)',
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

              {/* Store stats detail */}
              <div>
                <h4
                  className="mb-2 text-sm font-semibold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Stats
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: 'Rating',
                      value: formatRating(store.average_rating),
                      icon: Star,
                    },
                    {
                      label: 'Sales',
                      value: formatCompactNumber(store.total_sales),
                      icon: ShoppingBag,
                    },
                    {
                      label: 'Followers',
                      value: formatCompactNumber(store.total_followers),
                      icon: Users,
                    },
                    {
                      label: 'Reviews',
                      value: formatCompactNumber(store.total_reviews),
                      icon: Star,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3 text-center"
                      style={{
                        backgroundColor: 'var(--color-surface-elevated)',
                      }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ═══ MODALS ═══════════════════════════════════════ */}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="store"
        targetId={store?.id}
        targetName={store?.store_name}
      />

      {/* Admin Delete Store */}
      <ConfirmDeleteModal
        isOpen={showAdminDelete}
        onClose={() => setShowAdminDelete(false)}
        onConfirm={() => adminDeleteMutation.mutate()}
        isLoading={adminDeleteMutation.isPending}
        title="Delete this store?"
        description="This will permanently delete this store, all its product listings, images, and associated data. The owner's account will remain active but they will lose all store data."
        itemName={store?.store_name}
        itemType="Store"
        countdownSeconds={10}
      />
    </>
  );
}
