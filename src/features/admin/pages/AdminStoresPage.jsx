import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, X, Eye, MessageCircle,
  Trash2, Star, ShoppingBag, Users, Ban,
  ChevronRight, ExternalLink,
} from 'lucide-react';
import AdminService from '@api/services/admin.service';
import StoreService from '@api/services/store.service';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import BadgeUI from '@components/ui/Badge';
import Avatar from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import useDebounce from '@hooks/useDebounce';
import { cn, getErrorMessage } from '@lib/utils';
import { formatRating, formatCompactNumber, formatDate } from '@utils/formatters';
import toast from '@lib/toast';

export default function AdminStoresPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch]           = useState('');
  const [verifiedFilter, setVerified] = useState('');
  const [page, setPage]               = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const limit = 20;

  // Fetch stores
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.stores({
      search:      debouncedSearch,
      is_verified: verifiedFilter,
      page,
      limit,
    }),
    queryFn: () =>
      AdminService.getStores({
        search:      debouncedSearch || undefined,
        is_verified: verifiedFilter || undefined,
        page,
        limit,
      }),
  });

  const stores     = data?.data || [];
  const pagination = data?.pagination;

  // Verify/Unverify mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }) =>
      AdminService.verifyStore(id, {
        is_verified: verified,
      }),
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'stores'],
      });
      toast.success(
        verified
          ? 'Store verified ✅'
          : 'Store unverified'
      );
    },
    onError: (err) =>
      toast.error(getErrorMessage(err)),
  });

  // Suspend store owner
  const suspendMutation = useMutation({
    mutationFn: (userId) =>
      AdminService.updateUserStatus(userId, {
        status: 'suspended',
        reason: 'Store suspended by admin',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'stores'],
      });
      toast.success('Store owner suspended');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err)),
  });

  // Delete store (via deleting the user's store)
  const deleteMutation = useMutation({
    mutationFn: (storeId) =>
      StoreService.delete(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'stores'],
      });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      toast.success('Store deleted');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err)),
  });

  // Navigate to message seller
  const handleMessageSeller = (store) => {
    // Check if store has any products
    // Admin can message by going to a product and starting conversation
    // Or navigate to the store page
    if (store.slug) {
      navigate(`/store/${store.slug}`);
      toast(
        'Go to a product listing to message the seller',
        { icon: '💬' }
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Stores — Admin — Aliwayz</title>
      </Helmet>

      <div className="space-y-5">
        <PageHeader
          title="Manage Stores"
          subtitle={`${pagination?.total || 0} total stores`}
        />

        {/* ── Search + Filters ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search stores..."
              className="input-base pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {['', 'true', 'false'].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setVerified(val);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    verifiedFilter === val
                      ? 'var(--color-brand)'
                      : 'var(--color-surface)',
                  color:
                    verifiedFilter === val
                      ? 'white'
                      : 'var(--color-text-secondary)',
                  border: `1px solid ${
                    verifiedFilter === val
                      ? 'var(--color-brand)'
                      : 'var(--color-border)'
                  }`,
                }}
              >
                {val === ''
                  ? 'All'
                  : val === 'true'
                    ? '✅ Verified'
                    : '❌ Unverified'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stores List ─────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No stores found"
            description={
              search
                ? `No results for "${search}"`
                : 'No stores match the filters'
            }
          />
        ) : (
          <div className="space-y-2">
            {stores.map((store, i) => {
              const owner = store.users;

              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Store avatar */}
                      <Avatar
                        src={store.logo_url}
                        name={store.store_name}
                        size="md"
                      />

                      {/* Store info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-bold text-sm truncate"
                            style={{
                              color:
                                'var(--color-text-primary)',
                            }}
                          >
                            {store.store_name}
                          </span>

                          {store.is_verified && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                              style={{
                                backgroundColor:
                                  'rgba(16,185,129,0.1)',
                                color:
                                  'var(--color-success)',
                                border:
                                  '1px solid rgba(16,185,129,0.2)',
                              }}
                            >
                              ✅ Verified
                            </span>
                          )}

                          {!store.is_active && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                              style={{
                                backgroundColor:
                                  'rgba(239,68,68,0.1)',
                                color:
                                  'var(--color-error)',
                              }}
                            >
                              Inactive
                            </span>
                          )}
                        </div>

                        <div
                          className="flex flex-wrap items-center gap-2 text-xs mt-0.5"
                          style={{
                            color:
                              'var(--color-text-muted)',
                          }}
                        >
                          {owner && (
                            <span>
                              Owner: @
                              {owner.username ||
                                owner.email}
                            </span>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star
                              size={10}
                              fill="var(--color-warning)"
                              style={{
                                color:
                                  'var(--color-warning)',
                              }}
                            />
                            {formatRating(
                              store.average_rating
                            )}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <ShoppingBag size={10} />
                            {formatCompactNumber(
                              store.total_sales
                            )}{' '}
                            sales
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Users size={10} />
                            {formatCompactNumber(
                              store.total_followers
                            )}
                          </span>
                          <span>·</span>
                          <span>
                            {formatDate(
                              store.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      {/* ── Actions ───────────────────────── */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* View store */}
                        <Link
                          to={`/store/${store.slug}`}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)]"
                          style={{
                            color:
                              'var(--color-text-muted)',
                          }}
                          title="View store"
                        >
                          <Eye size={14} />
                        </Link>

                        {/* Message seller */}
                        <button
                          onClick={() =>
                            handleMessageSeller(store)
                          }
                          className="p-2 rounded-lg transition-colors hover:bg-blue-500/10"
                          style={{
                            color:
                              'var(--color-brand)',
                          }}
                          title="Message seller"
                        >
                          <MessageCircle
                            size={14}
                          />
                        </button>

                        {/* Verify/Unverify */}
                        <button
                          onClick={() =>
                            verifyMutation.mutate({
                              id: store.id,
                              verified:
                                !store.is_verified,
                            })
                          }
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            store.is_verified
                              ? 'hover:bg-yellow-500/10'
                              : 'hover:bg-green-500/10'
                          )}
                          style={{
                            color: store.is_verified
                              ? 'var(--color-warning)'
                              : 'var(--color-success)',
                          }}
                          title={
                            store.is_verified
                              ? 'Remove verification'
                              : 'Verify store'
                          }
                        >
                          <ShieldCheck size={14} />
                        </button>

                        {/* Suspend owner */}
                        {owner && (
                          <button
                            onClick={() =>
                              suspendMutation.mutate(
                                owner.id
                              )
                            }
                            className="p-2 rounded-lg transition-colors hover:bg-yellow-500/10"
                            style={{
                              color:
                                'var(--color-warning)',
                            }}
                            title="Suspend store owner"
                          >
                            <Ban size={14} />
                          </button>
                        )}

                        {/* Delete store */}
                        <button
                          onClick={() => {
                            setDeleteTarget(store);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                          style={{
                            color:
                              'var(--color-error)',
                          }}
                          title="Delete store"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {pagination &&
              pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.has_prev}
                    onClick={() =>
                      setPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span
                    className="text-xs"
                    style={{
                      color:
                        'var(--color-text-muted)',
                    }}
                  >
                    Page {pagination.page} of{' '}
                    {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.has_next}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ── Delete Store Confirmation ─────────────────────── */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={() =>
          deleteTarget &&
          deleteMutation.mutate(deleteTarget.id)
        }
        isLoading={deleteMutation.isPending}
        title="Delete this store?"
        description="This will permanently delete this store and all its product listings. The store owner's account will remain active but they will lose all store data."
        itemName={deleteTarget?.store_name}
        itemType="Store"
        countdownSeconds={10}
      />
    </>
  );
}