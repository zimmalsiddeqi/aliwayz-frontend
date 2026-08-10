import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingBag, TrendingUp, Star, Users } from 'lucide-react';
import StoreService from '@api/services/store.service';
import useMyStore from '@hooks/useMyStore';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import PageHeader from '@components/common/PageHeader';
import { formatCompactNumber, formatPrice, formatDate, formatRating } from '@utils/formatters';

export default function StoreAnalyticsPage() {
  const { store, hasStore, isLoading: storeLoading } = useMyStore();

  const { data, isLoading } = useQuery({
    queryKey: ['store-analytics', store?.id],
    queryFn:  () => StoreService.getAnalytics(store.id),
    enabled:  !!store?.id,
  });

  const analytics = data?.data;

  if (storeLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasStore) {
  return (
    <div className="space-y-6">
      <PageHeader title="Performance" />
      <EmptyState
        icon="📊"
        title="No analytics available"
        description="Start listing items to see your performance metrics. You can also set up a seller profile for better visibility."
        actionLabel="Create a Listing"
        actionTo="/sell/create"
      />
    </div>
  );
}

  return (
    <>
      <Helmet><title>Store Analytics — Aliwayz</title></Helmet>

      <PageHeader
        title="Store Analytics"
        subtitle={store?.store_name}
      />

      {analytics ? (
        <div className="space-y-6">
          {/* Overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Sales',    value: analytics.overview?.total_sales,     icon: ShoppingBag, color: 'var(--color-success)' },
              { label: 'Active',         value: analytics.overview?.active_listings, icon: TrendingUp,  color: 'var(--color-brand)' },
              { label: 'Total Listings', value: analytics.overview?.total_listings,  icon: TrendingUp,  color: '#8B5CF6' },
              { label: 'Rating',         value: formatRating(analytics.overview?.average_rating), icon: Star, color: 'var(--color-warning)' },
              { label: 'Views (30d)',    value: analytics.last_30_days?.views,       icon: Eye,         color: 'var(--color-info)' },
              { label: 'Favs (30d)',     value: analytics.last_30_days?.favorites,   icon: Heart,       color: 'var(--color-error)' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 text-center">
                  <s.icon
                    size={18}
                    className="mx-auto mb-2"
                    style={{ color: s.color }}
                  />
                  <p
                    className="text-xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {typeof s.value === 'number'
                      ? formatCompactNumber(s.value || 0)
                      : s.value || '0'}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {s.label}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent sales */}
          {analytics.recent_sales?.length > 0 && (
            <div>
              <h3
                className="font-semibold text-sm mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Recent Sales
              </h3>
              <div className="space-y-2">
                {analytics.recent_sales.map((sale) => (
                  <Card key={sale.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {sale.products?.title || 'Product'}
                      </span>
                      <span className="text-sm font-bold text-gradient-brand flex-shrink-0 ml-3">
                        {formatPrice(sale.products?.price)}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {formatDate(sale.created_at)}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>
            No analytics data available yet. Start selling!
          </p>
        </Card>
      )}
    </>
  );
}