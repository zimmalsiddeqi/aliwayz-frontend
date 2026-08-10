import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search, Ban, ShieldCheck, UserX,
  Eye, Trash2, X, MessageCircle,
  Star, ShoppingBag, Users, Calendar,
  Mail, Phone, MapPin,
} from 'lucide-react';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import Avatar from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import useDebounce from '@hooks/useDebounce';
import { cn, getErrorMessage } from '@lib/utils';
import {
  formatDate,
  formatRelativeTime,
  formatCompactNumber,
  formatRating,
} from '@utils/formatters';
import toast from '@lib/toast';

export default function AdminUsersPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch]           = useState('');
  const [roleFilter, setRole]         = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [page, setPage]               = useState(1);

  const [actionUser, setActionUser]     = useState(null);
  const [actionType, setActionType]     = useState('');
  const [actionReason, setActionReason] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);

  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget]       = useState(null);
  const [messageTargetProducts, setMessageTargetProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users({
      search: debouncedSearch,
      role:   roleFilter,
      status: statusFilter,
      page,
      limit,
    }),
    queryFn: () =>
      AdminService.getUsers({
        search: debouncedSearch || undefined,
        role:   roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
  });

  const users      = data?.data || [];
  const pagination = data?.pagination;

  const { data: userDetailData } = useQuery({
    queryKey: ['admin-user-detail', selectedUser?.id],
    queryFn:  () => AdminService.getUserDetail(selectedUser.id),
    enabled:  !!selectedUser?.id,
  });

  const userDetail = userDetailData?.data;

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) =>
      AdminService.updateUserStatus(id, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setActionUser(null);
      setActionType('');
      setActionReason('');
      toast.success('User status updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => AdminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setSelectedUser(null);
      toast.success('User deleted permanently');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleMessageUser = async (u) => {
    setMessageTarget(u);
    setLoadingProducts(true);
    setShowMessageModal(true);

    try {
      const ProductService = (await import('@api/services/product.service')).default;
      const response = await ProductService.browse({ page: 1, limit: 20 });
      setMessageTargetProducts(response?.data || []);
    } catch {
      setMessageTargetProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageTarget(null);
    setMessageTargetProducts([]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', border: 'rgba(16,185,129,0.2)' };
      case 'suspended':
        return { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', border: 'rgba(245,158,11,0.2)' };
      case 'banned':
        return { bg: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', border: 'rgba(239,68,68,0.2)' };
      default:
        return { bg: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)', border: 'var(--color-border)' };
    }
  };

  return (
    <>
      <Helmet>
        <title>Users — Admin — Aliwayz</title>
      </Helmet>

      <div className="space-y-5">
        <PageHeader
          title="Manage Users"
          subtitle={`${pagination?.total || 0} total users`}
        />

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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, username..."
              className="input-base pl-10 pr-10"
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
            <Select
              value={roleFilter}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'buyer', label: 'Buyer' },
                { value: 'seller', label: 'Seller' },
                { value: 'both', label: 'Both' },
                { value: 'admin', label: 'Admin' },
              ]}
              containerClassName="!space-y-0"
              className="!py-2 !rounded-xl text-xs min-w-[100px]"
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'banned', label: 'Banned' },
              ]}
              containerClassName="!space-y-0"
              className="!py-2 !rounded-xl text-xs min-w-[110px]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No users found"
            description={search ? `No results for "${search}"` : 'No users match the filters'}
          />
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const ss = getStatusStyle(u.account_status);
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar src={u.avatar_url} name={u.username} size="md" className="flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {u.full_name || u.username}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize" style={{ backgroundColor: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                            {u.account_status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                            {u.role}
                          </span>
                          {u.email_verified && <span className="text-[10px]" title="Email verified">✉✅</span>}
                          {u.phone_verified && <span className="text-[10px]" title="Phone verified">📱✅</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                          <span>@{u.username}</span>
                          <span>·</span>
                          <span className="truncate max-w-[120px] sm:max-w-none">{u.email}</span>
                          <span className="hidden sm:inline">· Joined {formatDate(u.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <button onClick={() => setSelectedUser(u)} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)]" style={{ color: 'var(--color-text-muted)' }} title="View details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleMessageUser(u)} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-blue-500/10" style={{ color: 'var(--color-brand)' }} title="Message user">
                          <MessageCircle size={14} />
                        </button>
                        {u.account_status === 'active' && u.role !== 'admin' && (
                          <button onClick={() => { setActionUser(u); setActionType('suspended'); setActionReason(''); }} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-yellow-500/10" style={{ color: 'var(--color-warning)' }} title="Suspend">
                            <UserX size={14} />
                          </button>
                        )}
                        {u.account_status !== 'banned' && u.role !== 'admin' && (
                          <button onClick={() => { setActionUser(u); setActionType('banned'); setActionReason(''); }} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: 'var(--color-error)' }} title="Ban">
                            <Ban size={14} />
                          </button>
                        )}
                        {u.account_status !== 'active' && u.role !== 'admin' && (
                          <button onClick={() => statusMutation.mutate({ id: u.id, status: 'active' })} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-green-500/10" style={{ color: 'var(--color-success)' }} title="Activate">
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => { setDeleteTarget(u); setShowDeleteModal(true); }} className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: 'var(--color-error)' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Page {pagination.page} of {pagination.total_pages}</span>
                <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ SUSPEND / BAN MODAL ══════════════════════════ */}
      <Modal
        isOpen={!!actionUser && !!actionType}
        onClose={() => { setActionUser(null); setActionType(''); setActionReason(''); }}
        title={`${actionType === 'banned' ? 'Ban' : 'Suspend'} User`}
        description={`${actionType === 'banned' ? 'Ban' : 'Suspend'} @${actionUser?.username}? They will lose access.`}
        size="sm"
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <Avatar src={actionUser?.avatar_url} name={actionUser?.username} size="sm" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{actionUser?.full_name || actionUser?.username}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{actionUser?.username} · {actionUser?.email}</p>
            </div>
          </div>
          <Input label="Reason (recommended)" placeholder="Why are you taking this action?" value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => { setActionUser(null); setActionType(''); setActionReason(''); }}>Cancel</Button>
            {actionType === 'suspended' && (
              <Button fullWidth isLoading={statusMutation.isPending} loadingText="Suspending..." onClick={() => statusMutation.mutate({ id: actionUser.id, status: 'suspended', reason: actionReason || 'Admin action' })} className="!bg-[var(--color-warning)] hover:!brightness-110">Suspend</Button>
            )}
            {actionType === 'banned' && (
              <Button variant="danger" fullWidth isLoading={statusMutation.isPending} loadingText="Banning..." onClick={() => statusMutation.mutate({ id: actionUser.id, status: 'banned', reason: actionReason || 'Admin action' })}>Ban User</Button>
            )}
          </div>
        </div>
      </Modal>

      {/* ═══ USER DETAIL MODAL ════════════════════════════ */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="md">
        {selectedUser && (
          <div className="space-y-5 mt-4">
            <div className="flex items-center gap-4">
              <Avatar src={selectedUser.avatar_url} name={selectedUser.username} size="xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{selectedUser.full_name || selectedUser.username}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>@{selectedUser.username}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize" style={{ backgroundColor: getStatusStyle(selectedUser.account_status).bg, color: getStatusStyle(selectedUser.account_status).color }}>{selectedUser.account_status}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize" style={{ backgroundColor: 'var(--color-brand-glow)', color: 'var(--color-brand)' }}>{selectedUser.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Mail size={13} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{selectedUser.email} {selectedUser.email_verified ? '✅' : '❌'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{selectedUser.phone_verified ? '✅ Verified' : '❌ Not verified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Joined</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Last Active</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{selectedUser.last_active_at ? formatRelativeTime(selectedUser.last_active_at) : 'Never'}</p>
                </div>
              </div>
            </div>

            {userDetail?.seller_stats && (
              <div>
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <ShoppingBag size={12} /> Seller Stats
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Sales', value: userDetail.seller_stats.total_sales, icon: ShoppingBag, color: 'var(--color-success)' },
                    { label: 'Rating', value: formatRating(userDetail.seller_stats.average_rating), icon: Star, color: 'var(--color-warning)' },
                    { label: 'Reviews', value: userDetail.seller_stats.total_reviews, icon: Star, color: '#8B5CF6' },
                    { label: 'Followers', value: userDetail.seller_stats.total_followers, icon: Users, color: 'var(--color-info)' },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                      <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                      <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{s.value || 0}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userDetail?.user_badges?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>🏆 Badges</h4>
                <div className="flex flex-wrap gap-1.5">
                  {userDetail.user_badges.filter((ub) => ub.is_active).map((ub) => (
                    <span key={ub.badges?.code || ub.id} className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--color-brand-glow)', color: 'var(--color-brand)', border: '1px solid rgba(91,110,245,0.2)' }}>
                      {ub.badges?.name || 'Badge'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Link to={`/user/${selectedUser.username}`} onClick={() => setSelectedUser(null)}>
                <Button variant="outline" size="sm" leftIcon={<Eye size={13} />}>View Profile</Button>
              </Link>
              <Button variant="outline" size="sm" leftIcon={<MessageCircle size={13} />} onClick={() => { setSelectedUser(null); handleMessageUser(selectedUser); }} style={{ color: 'var(--color-brand)' }}>Message</Button>
              {selectedUser.role !== 'admin' && (
                <>
                  {selectedUser.account_status === 'active' ? (
                    <>
                      <Button size="sm" onClick={() => { setSelectedUser(null); setActionUser(selectedUser); setActionType('suspended'); }} className="!bg-[var(--color-warning)] !text-white hover:!brightness-110">Suspend</Button>
                      <Button variant="danger" size="sm" onClick={() => { setSelectedUser(null); setActionUser(selectedUser); setActionType('banned'); }}>Ban</Button>
                    </>
                  ) : (
                    <Button size="sm" leftIcon={<ShieldCheck size={13} />} onClick={() => { statusMutation.mutate({ id: selectedUser.id, status: 'active' }); setSelectedUser(null); }}>Activate</Button>
                  )}
                  <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => { setSelectedUser(null); setDeleteTarget(selectedUser); setShowDeleteModal(true); }}>Delete</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ MESSAGE USER MODAL ═══════════════════════════ */}
      <Modal
        isOpen={showMessageModal}
        onClose={closeMessageModal}
        title={`Message @${messageTarget?.username}`}
        description="Select a product to start a conversation about"
        size="md"
      >
        <div className="space-y-3 mt-4">
          {loadingProducts ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : messageTargetProducts.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <span className="text-3xl">📭</span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No products available to start a conversation.
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                You can message users through their product listings.
              </p>
              <Link to={`/user/${messageTarget?.username}`} onClick={closeMessageModal}>
                <Button variant="outline" size="sm">View User Profile</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Click on a product to start a conversation with @{messageTarget?.username}:
              </p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {messageTargetProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      closeMessageModal();
                      navigate(`/inbox?product=${product.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 hover:bg-[var(--glass-bg-strong)]"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0].cdn_url || product.product_images[0].storage_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                        <span className="text-lg opacity-40">📦</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{product.title}</p>
                      <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="font-bold text-gradient-brand">${product.price}</span>
                        <span>·</span>
                        <span className="capitalize">{product.status}</span>
                      </div>
                    </div>
                    <MessageCircle size={16} style={{ color: 'var(--color-brand)' }} className="flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ═══ DELETE USER CONFIRMATION ═════════════════════ */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
        title="Delete this user permanently?"
        description="This will permanently delete this user account, anonymize all their personal data, remove their store (if any), and delete all their product listings. This action is irreversible."
        itemName={deleteTarget?.full_name || deleteTarget?.username}
        itemType="User"
        countdownSeconds={10}
      />
    </>
  );
}