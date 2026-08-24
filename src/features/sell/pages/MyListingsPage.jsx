import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit3,
  Eye,
  Heart,
  Trash2,
  EyeOff,
  Archive,
  MoreVertical,
  Filter,
  QrCode,
} from 'lucide-react';
import StoreService from '@api/services/store.service';
import ProductService from '@api/services/product.service';
import useMyStore from '@hooks/useMyStore';
import Button from '@components/ui/Button';
import BadgeUI from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Dropdown from '@components/ui/Dropdown';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import ListingQRModal from '@components/modals/ListingQRModal';
import { CATEGORY_IDS } from '@utils/constants';
import Spinner from '@components/ui/Spinner';
import { cn, formatPrice, getStatusColor, getErrorMessage } from '@lib/utils';
import { formatRelativeTime, formatCompactNumber } from '@utils/formatters';
import { getPrimaryImage } from '@utils/helpers';
import toast from '@lib/toast';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { store, hasStore, isLoading: storeLoading } = useMyStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [qrTarget, setQrTarget] = useState(null);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['my-listings', store?.slug, statusFilter],
    queryFn: () =>
      StoreService.getProducts(store.slug, {
        page: 1,
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    enabled: !!store?.slug,
  });

  const allProducts = data?.data || [];

  // Filter client-side for "all"
  const products =
    statusFilter === 'all' ? allProducts : allProducts.filter((p) => p.status === statusFilter);

  // ── Status mutation ────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ProductService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Status updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Delete mutation ────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      toast.success('Listing deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

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
      <PageHeader
        title="My Listings"
        subtitle="0 listings"
        rightAction={
          <Link to="/sell/create">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              New Listing
            </Button>
          </Link>
        }
      />
      <EmptyState
        icon="📦"
        title="No listings yet"
        description="You haven't listed anything for sale yet. Create your first listing now!"
        actionLabel="Create a Listing"
        actionTo="/sell/create"
      />
    </div>
  );
}

  const statusTabs = [
    { value: 'all', label: 'All', count: allProducts.length },
    {
      value: 'available',
      label: 'Active',
      count: allProducts.filter((p) => p.status === 'available').length,
    },
    {
      value: 'reserved',
      label: 'Reserved',
      count: allProducts.filter((p) => p.status === 'reserved').length,
    },
    {
      value: 'hidden',
      label: 'Hidden',
      count: allProducts.filter((p) => p.status === 'hidden').length,
    },
    {
      value: 'draft',
      label: 'Draft',
      count: allProducts.filter((p) => p.status === 'draft').length,
    },
    { value: 'sold', label: 'Sold', count: allProducts.filter((p) => p.status === 'sold').length },
  ];

  return (
    <>
      <Helmet>
        <title>My Listings — Aliwayz</title>
      </Helmet>

      <PageHeader
        title="My Listings"
        subtitle={`${allProducts.length} total`}
        rightAction={
          <Link to="/sell/create">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              New Listing
            </Button>
          </Link>
        }
      />

      {/* ── Status Tabs ───────────────────────────────────── */}
      <div className="-mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-all'
            )}
            style={{
              backgroundColor:
                statusFilter === tab.value ? 'var(--color-brand)' : 'var(--color-surface)',
              color: statusFilter === tab.value ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${statusFilter === tab.value ? 'var(--color-brand)' : 'var(--color-border)'}`,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor:
                    statusFilter === tab.value
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--color-surface-elevated)',
                  color: statusFilter === tab.value ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Products List ─────────────────────────────────── */}
      {products.length === 0 ? (
        <EmptyState
          icon={statusFilter === 'all' ? '📦' : '🔍'}
          title={statusFilter === 'all' ? 'No listings yet' : `No ${statusFilter} listings`}
          description={
            statusFilter === 'all' ? 'Create your first listing!' : 'Try changing the filter'
          }
          actionLabel={statusFilter === 'all' ? 'Create Listing' : undefined}
          actionTo={statusFilter === 'all' ? '/sell/create' : undefined}
        />
      ) : (
        <div className="space-y-2">
          {products.map((product, i) => {
            const image = getPrimaryImage(product.product_images);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="card p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/product/${product.id}`} className="flex-shrink-0">
                      {image ? (
                        <img src={image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                      ) : (
                        <div
                          className="flex h-20 w-20 items-center justify-center rounded-xl"
                          style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                        >
                          <span className="text-2xl opacity-30">📦</span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${product.id}`}>
                          <h4
                            className="truncate text-sm font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {product.title}
                          </h4>
                        </Link>
                        <span
                          className={cn(
                            'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                            getStatusColor(product.status)
                          )}
                        >
                          {product.status}
                        </span>
                      </div>

                      <p className="text-gradient-brand mt-0.5 text-sm font-bold">
                        {formatPrice(product.price, product.currency)}
                      </p>

                      <div
                        className="mt-2 flex items-center gap-3 text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          {formatCompactNumber(product.view_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={11} />
                          {formatCompactNumber(product.favorite_count)}
                        </span>
                        <span>{formatRelativeTime(product.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions dropdown */}
                    <div className="flex-shrink-0 self-center">
                      <Dropdown
                        align="right"
                        trigger={
                          <span
                            className="inline-flex rounded-xl p-2 hover:bg-[var(--glass-bg-strong)]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <MoreVertical size={16} />
                          </span>
                        }
                        items={[
                          {
                            icon: <Edit3 size={14} />,
                            label: 'Edit',
                            onClick: () => navigate(`/sell/edit/${product.id}`),
                          },
                          {
                            icon: <Eye size={14} />,
                            label: 'View',
                            onClick: () => navigate(`/product/${product.id}`),
                          },
                          ...([CATEGORY_IDS.VEHICLES, CATEGORY_IDS.AUTOMOTIVE, CATEGORY_IDS.REAL_ESTATE, CATEGORY_IDS.PROPERTY].includes(product.category_id)
                            ? [
                                {
                                  icon: <QrCode size={14} />,
                                  label: '▣ Listing QR Code',
                                  onClick: () => setQrTarget(product),
                                },
                              ]
                            : []),
                          { divider: true },
                          ...(product.status !== 'available'
                            ? [
                                {
                                  icon: <Eye size={14} />,
                                  label: 'Mark Available',
                                  onClick: () =>
                                    statusMutation.mutate({ id: product.id, status: 'available' }),
                                },
                              ]
                            : []),
                          ...(product.status !== 'hidden'
                            ? [
                                {
                                  icon: <EyeOff size={14} />,
                                  label: 'Hide',
                                  onClick: () =>
                                    statusMutation.mutate({ id: product.id, status: 'hidden' }),
                                },
                              ]
                            : []),
                          ...(product.status !== 'reserved'
                            ? [
                                {
                                  icon: <Archive size={14} />,
                                  label: 'Mark Reserved',
                                  onClick: () =>
                                    statusMutation.mutate({ id: product.id, status: 'reserved' }),
                                },
                              ]
                            : []),
                          { divider: true },
                          {
                            icon: <Trash2 size={14} />,
                            label: 'Delete',
                            danger: true,
                            onClick: () => {
                              setDeleteTarget(product);
                              setShowDeleteModal(true);
                            },
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────── */}
      {/* ── Delete Confirmation with Countdown ──────────── */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
        title="Delete this listing?"
        description="This product will be permanently removed from your store and the marketplace."
        itemName={deleteTarget?.title}
        itemType="Product"
        countdownSeconds={10}
      />
      
      {/* ── Listing QR Code Modal ───────────────────────── */}
      <ListingQRModal
        isOpen={!!qrTarget}
        onClose={() => setQrTarget(null)}
        product={qrTarget}
      />
    </>
  );
}
