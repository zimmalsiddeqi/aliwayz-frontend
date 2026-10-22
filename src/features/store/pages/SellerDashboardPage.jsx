import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Plus,
  Settings,
  ShieldCheck,
  Edit3,
  ExternalLink,
  MessageCircle,
  Package,
  Eye,
  ArrowRight,
  Store,
  User,
  Clock,
  Calendar,
  Layers,
  Star,
} from 'lucide-react';
import ProductService from '@api/services/product.service';
import StoreService from '@api/services/store.service';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useMyStore from '@hooks/useMyStore';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import { formatPrice, formatChatTime, cn } from '@lib/utils';
import { formatCompactNumber, formatRating } from '@utils/formatters';
import { getPrimaryImage, getOtherParticipant, getUnreadCount } from '@utils/helpers';
import { getProductUrl } from '@utils/categoryHelpers';
import { parseStoreMeta } from '@utils/sellerMeta';

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { store, hasStore, isLoading: storeLoading } = useMyStore();

  const storeMeta = parseStoreMeta(store);
  const sellerMode =
    typeof window !== 'undefined' && user?.id
      ? localStorage.getItem(`aliwayz_seller_mode_${user.id}`)
      : null;

  // Determine whether to display Business Dashboard or Individual Seller Dashboard
  const isBusinessSeller = Boolean(
    hasStore &&
      (storeMeta.isBusinessProfile || sellerMode === 'business') &&
      sellerMode !== 'personal'
  );

  const toggleSellerMode = () => {
    if (!user?.id) return;
    const nextMode = isBusinessSeller ? 'personal' : 'business';
    localStorage.setItem(`aliwayz_seller_mode_${user.id}`, nextMode);
    window.location.reload();
  };

  // ── 1. Fetch real listings created by seller ─────────────
  const { data: myProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['seller-dashboard-products', user?.id, store?.slug],
    queryFn: async () => {
      try {
        const res = await ProductService.getMyListings({
          page: 1,
          limit: 100,
          status: 'all',
        });
        if (res?.data && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (_err) {
        // Fallback below
      }
      if (store?.slug) {
        const storeRes = await StoreService.getProducts(store.slug, {
          page: 1,
          limit: 100,
          status: 'all',
        });
        return storeRes?.data || [];
      }
      return [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // ── 2. Fetch real conversations & customer inquiries ─────
  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: queryKeys.conversations.all(),
    queryFn: () => ChatService.getConversations({ page: 1, limit: 50 }),
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  if (storeLoading || productsLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const allProducts = myProducts;
  const userProductIds = new Set(allProducts.map((p) => p.id));

  // Active listings
  const activeListings = allProducts.filter(
    (p) => p.status === 'available' || p.status === 'active'
  );

  // Total views directly aggregated from real database listings
  const totalViews = allProducts.reduce((sum, p) => {
    const count = Number(p.view_count || p.views_count || 0);
    return sum + (isNaN(count) ? 0 : count);
  }, 0);

  // Filter conversations where current user is the seller or regarding one of the seller's listings
  const rawConversations = convData?.data || [];
  const sellerInquiries = rawConversations.filter((c) => {
    if (c.seller_id === user?.id || c.seller?.id === user?.id) return true;
    if (c.products && userProductIds.has(c.products.id)) return true;
    if (c.product_id && userProductIds.has(c.product_id)) return true;
    return false;
  });

  // Use seller inquiries; if none found, include all user conversations as fallback
  const inquiriesList =
    sellerInquiries.length > 0 ? sellerInquiries : rawConversations;

  // Real inquiry counts per listing ID
  const inquiriesByProduct = {};
  inquiriesList.forEach((c) => {
    const pid = c.product_id || c.products?.id;
    if (pid) {
      inquiriesByProduct[pid] = (inquiriesByProduct[pid] || 0) + 1;
    }
  });

  // Calculate real new/unread inquiries
  const newInquiriesCount = inquiriesList.filter((c) => getUnreadCount(c, user?.id) > 0).length;

  // Calculate real unanswered inquiries (unread or buyer sent last message)
  const unansweredCount = inquiriesList.filter((c) => {
    const unread = getUnreadCount(c, user?.id) > 0;
    const lastFromBuyer = c.last_message_sender_id && c.last_message_sender_id !== user?.id;
    return unread || lastFromBuyer;
  }).length;

  // Detect appointment/schedule inquiries
  const isAppointmentInquiry = (c) => {
    const text = (c.last_message_preview || '').toLowerCase();
    return (
      text.includes('test drive') ||
      text.includes('appointment') ||
      text.includes('schedule') ||
      text.includes('tour') ||
      text.includes('visit') ||
      text.includes('viewing') ||
      text.includes('meet')
    );
  };

  const appointmentsCount =
    inquiriesList.filter(isAppointmentInquiry).length +
    allProducts.filter((p) => p.status === 'reserved').length;

  const firstName =
    (user?.full_name || user?.username || 'Seller').trim().split(/\s+/)[0] ||
    'Seller';

  // Helper to build realistic subtitle for listing row
  const getListingSubtitle = (p) => {
    const priceStr = formatPrice(p.price, p.currency || 'USD');
    const parts = [];
    if (p.mileage !== undefined && p.mileage !== null && p.mileage !== '') {
      parts.push(`${Number(p.mileage).toLocaleString()} miles`);
    } else if (p.bedrooms || p.bathrooms) {
      const bedStr = p.bedrooms ? `${p.bedrooms} Beds` : '';
      const bathStr = p.bathrooms ? `${p.bathrooms} Baths` : '';
      const bedBath = [bedStr, bathStr].filter(Boolean).join(' · ');
      if (bedBath) parts.push(bedBath);
    } else if (p.condition) {
      const cond = String(p.condition)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      parts.push(cond);
    }
    if (p.location_city) {
      parts.push(p.location_city);
    }
    return [priceStr, ...parts].join(' · ');
  };

  const getStatusBadge = (status) => {
    const s = (status || 'available').toLowerCase();
    if (s === 'available' || s === 'active') {
      return {
        label: 'Active',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10B981',
        border: 'rgba(16, 185, 129, 0.3)',
      };
    }
    if (s === 'reserved') {
      return {
        label: 'Reserved',
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
        border: 'rgba(245, 158, 11, 0.3)',
      };
    }
    if (s === 'sold') {
      return {
        label: 'Sold',
        bg: 'rgba(100, 116, 139, 0.14)',
        color: 'var(--color-text-secondary)',
        border: 'var(--color-border)',
      };
    }
    return {
      label: s.charAt(0).toUpperCase() + s.slice(1),
      bg: 'rgba(91, 110, 245, 0.12)',
      color: 'var(--color-brand)',
      border: 'rgba(91, 110, 245, 0.25)',
    };
  };

  // ════════════════════════════════════════════════════════════
  // 1. BUSINESS SELLER DASHBOARD ("8. Dashboard – Business Seller")
  // ════════════════════════════════════════════════════════════
  if (isBusinessSeller) {
    return (
      <>
        <Helmet>
          <title>Business Overview — {store?.store_name || 'Aliwayz'}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6"
        >
          {/* Top Business Profile Header Card */}
          <div
            className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <Avatar
                src={store?.logo_url}
                name={store?.store_name || 'Business'}
                size="xl"
              />
              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-extrabold tracking-tight truncate"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {store?.store_name || 'My Business Storefront'}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {store?.is_verified ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <ShieldCheck size={13} />
                      Verified Business
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.10)',
                        color: '#2563EB',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      <Store size={13} />
                      Business Storefront
                    </span>
                  )}
                  {storeMeta.businessTypeLabel && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      · {storeMeta.businessTypeLabel}
                    </span>
                  )}
                  {Number(store?.average_rating) > 0 && Number(store?.total_reviews) > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: '#F59E0B' }}
                    >
                      <Star size={12} fill="#F59E0B" />
                      {formatRating(store.average_rating)} ({store.total_reviews})
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20"
                    >
                      🌱 New Seller
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {store?.slug && (
                <Link
                  to={`/store/${store.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors hover:bg-[var(--glass-bg-strong)]"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <ExternalLink size={15} />
                  <span>View Storefront</span>
                </Link>
              )}
              <Link
                to="/sell/create?mode=business"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                }}
              >
                <Plus size={16} />
                <span>Create Listing</span>
              </Link>
            </div>
          </div>

          {/* Business Overview: 4 KPI Stat Cards */}
          <div
            className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Business Overview
              </h2>

              <button
                type="button"
                onClick={toggleSellerMode}
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-text-muted)' }}
                title="Switch between Personal and Business dashboard"
              >
                Switch to Personal View
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: 'Active Listings',
                  value: activeListings.length,
                  to: '/sell/my-listings',
                },
                {
                  label: 'New Inquiries',
                  value: newInquiriesCount,
                  to: '/inbox',
                },
                {
                  label: 'Unanswered',
                  value: unansweredCount,
                  to: '/inbox',
                },
                {
                  label: 'Appointments',
                  value: appointmentsCount,
                  to: '/inbox',
                },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  to={stat.to}
                  className="rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand)]"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formatCompactNumber(stat.value)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Inquiries Card (100% Real Inquiries) */}
          <div
            className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Recent Inquiries
              </h2>
              {inquiriesList.length > 0 && (
                <Link
                  to="/inbox"
                  className="text-xs sm:text-sm font-bold hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  View all
                </Link>
              )}
            </div>

            {convLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : inquiriesList.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center border"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <MessageCircle
                  size={28}
                  className="mx-auto mb-2 opacity-60"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <p
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  No customer inquiries yet
                </p>
                <p
                  className="text-xs mt-1 max-w-sm mx-auto"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  When buyers message you about your listings or request an appointment, their inquiries will appear here.
                </p>
              </div>
            ) : (
              <div
                className="divide-y rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {inquiriesList.slice(0, 5).map((conv) => {
                  const other = getOtherParticipant(conv, user?.id);
                  const unread = getUnreadCount(conv, user?.id);
                  const product = conv.products;
                  const thumb = getPrimaryImage(product?.product_images);
                  const buyerName =
                    other?.full_name || other?.username || 'Customer';
                  const topic =
                    product?.title ||
                    conv.last_message_preview ||
                    'Product Inquiry';
                  const isAppt = isAppointmentInquiry(conv);
                  const isAwaitingReply =
                    unread === 0 &&
                    conv.last_message_sender_id &&
                    conv.last_message_sender_id !== user?.id;

                  let badge = {
                    label: 'Active',
                    bg: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    border: 'rgba(16, 185, 129, 0.3)',
                  };
                  if (unread > 0) {
                    badge = {
                      label: 'New',
                      bg: 'rgba(37, 99, 235, 0.12)',
                      color: '#2563EB',
                      border: 'rgba(37, 99, 235, 0.3)',
                    };
                  } else if (isAppt) {
                    badge = {
                      label: 'Appointment',
                      bg: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      border: 'rgba(16, 185, 129, 0.3)',
                    };
                  } else if (isAwaitingReply) {
                    badge = {
                      label: 'Awaiting Reply',
                      bg: 'rgba(245, 158, 11, 0.12)',
                      color: '#F59E0B',
                      border: 'rgba(245, 158, 11, 0.3)',
                    };
                  }

                  return (
                    <Link
                      key={conv.id}
                      to={`/inbox/${conv.id}`}
                      className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 transition-colors hover:bg-[var(--glass-bg-strong)]"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={topic}
                            className="w-14 h-11 sm:w-16 sm:h-12 rounded-xl object-cover flex-shrink-0 border"
                            style={{ borderColor: 'var(--color-border)' }}
                          />
                        ) : (
                          <Avatar
                            src={other?.avatar_url}
                            name={buyerName}
                            size="md"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs sm:text-sm font-bold truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {buyerName}
                          </p>
                          <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {topic}
                          </p>
                          {conv.last_message_at && (
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {formatChatTime(conv.last_message_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Inventory Card (100% Real Inventory) */}
          <div
            className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Recent Inventory
              </h2>
              <Link
                to="/sell/my-listings"
                className="text-xs sm:text-sm font-bold hover:underline"
                style={{ color: '#2563EB' }}
              >
                Manage Inventory →
              </Link>
            </div>

            {allProducts.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center border"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <Package
                  size={28}
                  className="mx-auto mb-2 opacity-60"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <p
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  No inventory listed yet
                </p>
                <p
                  className="text-xs mt-1 max-w-sm mx-auto mb-4"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Add your first vehicle, property, or goods listing to start selling through your storefront.
                </p>
                <Link
                  to="/sell/create?mode=business"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  }}
                >
                  <Plus size={15} />
                  <span>Create First Listing</span>
                </Link>
              </div>
            ) : (
              <div
                className="divide-y rounded-2xl border overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {allProducts.slice(0, 6).map((p) => {
                  const thumb = getPrimaryImage(p.product_images);
                  const badge = getStatusBadge(p.status);
                  const inquiryCount = inquiriesByProduct[p.id] || 0;
                  const viewCount = Number(p.view_count || p.views_count || 0);

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 transition-colors hover:bg-[var(--glass-bg-strong)]"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <Link
                        to={getProductUrl(p)}
                        className="flex items-center gap-3.5 min-w-0 flex-1"
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={p.title}
                            className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover flex-shrink-0 border"
                            style={{ borderColor: 'var(--color-border)' }}
                          />
                        ) : (
                          <div
                            className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 border"
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              borderColor: 'var(--color-border)',
                            }}
                          >
                            <Package
                              size={18}
                              style={{ color: 'var(--color-text-muted)' }}
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs sm:text-sm font-bold truncate"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {p.title}
                          </p>
                          <p
                            className="text-xs mt-0.5 truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {getListingSubtitle(p)}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {formatCompactNumber(viewCount)} views ·{' '}
                            {inquiryCount}{' '}
                            {inquiryCount === 1 ? 'inquiry' : 'inquiries'}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                        <Link
                          to={`/sell/edit/${p.id}`}
                          className="p-1.5 sm:p-2 rounded-xl border transition-colors hover:bg-[var(--color-surface)]"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                          title="Edit Listing"
                        >
                          <Edit3 size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. INDIVIDUAL SELLER DASHBOARD ("7. Dashboard – Individual Seller")
  // ════════════════════════════════════════════════════════════
  return (
    <>
      <Helmet>
        <title>Seller Dashboard — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        {/* Top Greeting Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              Hi, {firstName}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Individual Seller Overview
              </span>
              {Number(user?.seller_stats?.average_rating) > 0 && Number(user?.seller_stats?.total_reviews) > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star size={12} fill="#F59E0B" />
                  {formatRating(user.seller_stats.average_rating)} ({user.seller_stats.total_reviews})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                  🌱 New Seller
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasStore && (
              <button
                type="button"
                onClick={toggleSellerMode}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors hover:bg-[var(--glass-bg-strong)]"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                Switch to Business View
              </button>
            )}
            <Link
              to="/profile/edit"
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              title="Profile Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* 3 KPI Stat Cards (100% Real Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: 'Active Listings',
              value: activeListings.length,
              to: '/sell/my-listings',
            },
            {
              label: 'Total Views',
              value: totalViews,
              to: '/sell/my-listings',
            },
            {
              label: 'Inquiries',
              value: inquiriesList.length,
              to: '/inbox',
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="rounded-2xl p-4 sm:p-5 border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand)]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p
                className="text-xs sm:text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {stat.label}
              </p>
              <p
                className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formatCompactNumber(stat.value)}
              </p>
            </Link>
          ))}
        </div>

        {/* My Listings Card (100% Real Seller Listings) */}
        <div
          className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              My Listings
            </h2>

            <Link
              to="/sell/create?mode=personal"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
            >
              <Plus size={16} />
              <span>Create Listing</span>
            </Link>
          </div>

          {allProducts.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center border"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Package
                size={30}
                className="mx-auto mb-2 opacity-60"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                No listings yet
              </p>
              <p
                className="text-xs mt-1 max-w-sm mx-auto mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                You haven&apos;t posted any items, vehicles, or properties for sale yet.
              </p>
              <Link
                to="/sell/create?mode=personal"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                }}
              >
                <Plus size={15} />
                <span>Create Your First Listing</span>
              </Link>
            </div>
          ) : (
            <div
              className="divide-y rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {allProducts.slice(0, 8).map((p) => {
                const thumb = getPrimaryImage(p.product_images);
                const badge = getStatusBadge(p.status);
                const inquiryCount = inquiriesByProduct[p.id] || 0;
                const viewCount = Number(p.view_count || p.views_count || 0);

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 transition-colors hover:bg-[var(--glass-bg-strong)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Link
                      to={getProductUrl(p)}
                      className="flex items-center gap-3.5 min-w-0 flex-1"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.title}
                          className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover flex-shrink-0 border"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      ) : (
                        <div
                          className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 border"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <Package
                            size={18}
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs sm:text-sm font-bold truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {p.title}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {getListingSubtitle(p)}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {formatCompactNumber(viewCount)} views ·{' '}
                          {inquiryCount}{' '}
                          {inquiryCount === 1 ? 'inquiry' : 'inquiries'}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                      <Link
                        to={`/sell/edit/${p.id}`}
                        className="p-1.5 sm:p-2 rounded-xl border transition-colors hover:bg-[var(--color-surface)]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                        title="Edit Listing"
                      >
                        <Edit3 size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {allProducts.length > 8 && (
            <div className="pt-2 text-center">
              <Link
                to="/sell/my-listings"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold hover:underline"
                style={{ color: '#2563EB' }}
              >
                <span>View All {allProducts.length} Listings</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
