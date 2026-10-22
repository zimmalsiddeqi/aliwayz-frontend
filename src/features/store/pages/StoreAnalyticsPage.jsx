import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  ShoppingBag,
  TrendingUp,
  Star,
  Package,
  Plus,
  ExternalLink,
  ShieldCheck,
  Store,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import StoreService from '@api/services/store.service';
import ProductService from '@api/services/product.service';
import useAuthStore from '@store/auth.store';
import useMyStore from '@hooks/useMyStore';
import Avatar from '@components/ui/Avatar';
import Spinner from '@components/ui/Spinner';
import { formatCompactNumber, formatPrice, formatDate, formatRating } from '@utils/formatters';
import { getPrimaryImage } from '@utils/helpers';
import { getProductUrl } from '@utils/categoryHelpers';
import { parseStoreMeta } from '@utils/sellerMeta';

export default function StoreAnalyticsPage() {
  const { user } = useAuthStore();
  const { store, hasStore, isLoading: storeLoading } = useMyStore();

  const storeMeta = parseStoreMeta(store);

  // 1. Fetch real store analytics from backend
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['store-analytics', store?.id],
    queryFn: () => StoreService.getAnalytics(store.id),
    enabled: !!store?.id,
    refetchInterval: 30000,
  });

  // 2. Fetch real seller listings directly to guarantee 100% accurate, live inventory counts
  const { data: myProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['seller-performance-products', user?.id, store?.slug],
    queryFn: async () => {
      try {
        const res = await ProductService.getMyListings({
          page: 1,
          limit: 100,
          status: 'all',
        });
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (_err) {
        // Fallback to store products
      }
      if (store?.slug) {
        const storeRes = await StoreService.getProducts(store.slug, {
          page: 1,
          limit: 100,
          status: 'all',
        });
        if (Array.isArray(storeRes)) return storeRes;
        return storeRes?.data || [];
      }
      return [];
    },
    enabled: !!user?.id || !!store?.slug,
    refetchInterval: 30000,
  });

  const isLoading = storeLoading || analyticsLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            Store Performance & Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Track sales, listing views, and customer engagements for your store.
          </p>
        </div>

        <div
          className="rounded-3xl p-8 sm:p-12 text-center border shadow-sm max-w-xl mx-auto space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            }}
          >
            <TrendingUp size={28} />
          </div>
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Set Up Your Storefront
          </h2>
          <p
            className="text-xs sm:text-sm max-w-md mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Create a Business Storefront or list your first items to unlock detailed analytics, customer interaction tracking, and sales performance.
          </p>
          <div className="pt-2">
            <Link
              to="/sell/create?mode=business"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
            >
              <Plus size={16} />
              <span>Create Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.data;

  // Direct calculation from seller's actual live listings
  const allProducts = myProducts;
  const activeListings = allProducts.filter(
    (p) => p.status === 'available' || p.status === 'active'
  );
  const activeListingsCount = activeListings.length;
  const totalListingsCount = allProducts.length;

  const totalViews = allProducts.reduce((sum, p) => {
    const count = Number(p.view_count || p.views_count || 0);
    return sum + (isNaN(count) ? 0 : count);
  }, 0);

  const totalFavorites = allProducts.reduce((sum, p) => {
    const count = Number(p.favorite_count || 0);
    return sum + (isNaN(count) ? 0 : count);
  }, 0);

  // Status badge styling helper
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

  return (
    <>
      <Helmet>
        <title>Performance & Store Analytics — {store?.store_name || 'Aliwayz'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        {/* 1. Storefront Identity & Quick Action Header */}
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
              name={store?.store_name || 'Store'}
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
                {store?.store_name}
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
                    Storefront Active
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
              </div>
            </div>
          </div>

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
              to="/sell/create"
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

        {/* 2. Performance Overview – 6 Dynamic KPI Cards */}
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
              Performance Metrics
            </h2>
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Live seller metrics
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                label: 'Active Listings',
                value: activeListingsCount,
                icon: TrendingUp,
                color: '#2563EB',
                to: '/sell/my-listings',
              },
              {
                label: 'Total Listings',
                value: totalListingsCount,
                icon: Package,
                color: '#8B5CF6',
                to: '/sell/my-listings',
              },
              {
                label: 'Total Views',
                value: totalViews,
                icon: Eye,
                color: '#06B6D4',
                to: '/sell/my-listings',
              },
              {
                label: 'Saved Items',
                value: totalFavorites || (analytics?.last_30_days?.favorites || 0),
                icon: Heart,
                color: '#EC4899',
                to: '/sell/my-listings',
              },
              {
                label: 'Total Sales',
                value: analytics?.overview?.total_sales || 0,
                icon: ShoppingBag,
                color: '#10B981',
                to: '/sell/my-listings',
              },
              {
                label: 'Store Rating',
                value: formatRating(analytics?.overview?.average_rating || store?.average_rating),
                icon: Star,
                color: '#F59E0B',
                to: store?.slug ? `/store/${store.slug}` : '#',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={stat.to}
                  className="block rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand)] h-full"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <stat.icon
                    size={18}
                    className="mb-2"
                    style={{ color: stat.color }}
                  />
                  <p
                    className="text-2xl font-extrabold tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {typeof stat.value === 'number'
                      ? formatCompactNumber(stat.value)
                      : stat.value || '0'}
                  </p>
                  <p
                    className="text-xs font-medium mt-1 truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {stat.label}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Real Listing Inventory & Performance */}
        <div
          className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Inventory Performance
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Real performance data for your store listings
              </p>
            </div>
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
                size={30}
                className="mx-auto mb-2 opacity-60"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                No listings created yet
              </p>
              <p
                className="text-xs mt-1 max-w-sm mx-auto mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Add your vehicles, real estate, or retail goods to view individual listing view counts and performance metrics.
              </p>
              <Link
                to="/sell/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
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
              {allProducts.map((p) => {
                const thumb = getPrimaryImage(p.product_images);
                const badge = getStatusBadge(p.status);
                const viewCount = Number(p.view_count || p.views_count || 0);
                const favCount = Number(p.favorite_count || 0);

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
                          {formatPrice(p.price, p.currency || 'USD')}
                          {p.location_city && ` · ${p.location_city}`}
                        </p>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {formatCompactNumber(viewCount)} views
                          {favCount > 0 && ` · ${favCount} saves`}
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

        {/* 4. Recent Sales (if any recorded) */}
        {analytics?.recent_sales?.length > 0 && (
          <div
            className="w-full rounded-3xl p-5 sm:p-6 border shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              Recent Completed Sales
            </h2>

            <div
              className="divide-y rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {analytics.recent_sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3.5 sm:p-4"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {sale.products?.title || 'Listing Sale'}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {formatDate(sale.created_at)}
                    </p>
                  </div>
                  <span
                    className="text-xs sm:text-sm font-extrabold flex-shrink-0"
                    style={{ color: '#10B981' }}
                  >
                    {formatPrice(sale.products?.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
