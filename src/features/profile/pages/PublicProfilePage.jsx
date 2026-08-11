import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Star,
  ShoppingBag,
  Users,
  Flag,
  MessageCircle,
  Ban,
  Trash2,
  ShieldCheck,
  UserX,
  ChevronRight,
} from 'lucide-react';
import UserService from '@api/services/user.service';
import ReviewService from '@api/services/review.service';
import AdminService from '@api/services/admin.service';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import BadgeUI from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import PageHeader from '@components/common/PageHeader';
import ReportModal from '@components/modals/ReportModal';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';
import UserReviewsSection from '@features/profile/components/UserReviewsSection';
import { cn, getErrorMessage, isAdmin } from '@lib/utils';
import { formatMemberSince, formatCompactNumber, formatRating } from '@utils/formatters';
import { getBadgeDisplay } from '@utils/helpers';
import toast from '@lib/toast';

export default function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ FIX: Destructure user properly from auth store
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isCurrentAdmin = isAdmin(currentUser?.role);

  const [showReport, setShowReport] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Fetch profile
  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => UserService.getPublicProfile(username),
    enabled: !!username,
  });

  const profile = profileData?.data;
  const stats = profile?.seller_stats;
  const badges = (profile?.user_badges || []).filter((b) => b.is_active);

  const isOwnProfile = currentUser?.id === profile?.id;

  // ── Admin: Ban/Suspend user ────────────────────────────
  const banMutation = useMutation({
    mutationFn: ({ status, reason }) =>
      AdminService.updateUserStatus(profile.id, {
        status,
        reason,
      }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile(username),
      });
      setShowBanModal(false);
      setBanReason('');
      toast.success(`User ${status === 'banned' ? 'banned' : 'suspended'} successfully`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Admin: Activate user ───────────────────────────────
  const activateMutation = useMutation({
    mutationFn: () =>
      AdminService.updateUserStatus(profile.id, {
        status: 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile(username),
      });
      toast.success('User activated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Admin: Delete user ─────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => AdminService.deleteUser(profile.id),
    onSuccess: () => {
      toast.success('User deleted');
      navigate('/admin/users');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Message user ───────────────────────────────────────
  const messageMutation = useMutation({
    mutationFn: async () => {
      // We need a product to start conversation
      // For admin messaging, navigate to inbox with a note
      toast.error(
        'To message a user, go to one of their product listings and click "Message Seller"'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container-app py-12">
        <EmptyState
          icon="👤"
          title="User not found"
          description="This user doesn't exist or has been deactivated."
          actionLabel="Go Home"
          actionTo="/"
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.full_name || profile.username} — Aliwayz</title>
      </Helmet>

      <div className="container-app max-w-3xl space-y-5 py-4 pb-24 sm:py-6 md:pb-8">
        <PageHeader showBack title="" />

        {/* ═══ ADMIN BAR ══════════════════════════════════ */}
        {isCurrentAdmin && !isOwnProfile && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className="p-3 sm:p-4"
              style={{
                borderColor: 'rgba(91,110,245,0.3)',
                backgroundColor: 'rgba(91,110,245,0.05)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} style={{ color: 'var(--color-brand)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-brand)' }}>
                    Admin Actions
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold capitalize"
                    style={{
                      backgroundColor:
                        profile.account_status === 'active'
                          ? 'rgba(16,185,129,0.1)'
                          : 'rgba(239,68,68,0.1)',
                      color:
                        profile.account_status === 'active'
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                    }}
                  >
                    {profile.account_status || 'active'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Activate */}
                  {profile.account_status !== 'active' && (
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<ShieldCheck size={12} />}
                      isLoading={activateMutation.isPending}
                      onClick={() => activateMutation.mutate()}
                      className="!border-[rgba(16,185,129,0.3)] !text-[var(--color-success)]"
                    >
                      Activate
                    </Button>
                  )}

                  {/* Suspend */}
                  {profile.account_status === 'active' && (
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<UserX size={12} />}
                      onClick={() => {
                        setBanReason('');
                        setShowBanModal(true);
                      }}
                      className="!border-[rgba(245,158,11,0.3)] !text-[var(--color-warning)]"
                    >
                      Suspend
                    </Button>
                  )}

                  {/* Ban */}
                  {profile.account_status !== 'banned' && (
                    <Button
                      size="xs"
                      variant="danger"
                      leftIcon={<Ban size={12} />}
                      onClick={() => {
                        setBanReason('');
                        setShowBanModal(true);
                      }}
                    >
                      Ban
                    </Button>
                  )}

                  {/* Delete */}
                  <Button
                    size="xs"
                    variant="danger"
                    leftIcon={<Trash2 size={12} />}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ═══ PROFILE HEADER ═════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glass" className="p-6 text-center">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name || profile.username}
              size="2xl"
              className="mx-auto"
            />

            <h1 className="mt-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              @{profile.username}
            </p>

            {/* Role badge */}
            <div className="mt-2 flex justify-center">
              <span
                className="rounded-full px-3 py-0.5 text-[10px] font-bold capitalize"
                style={{
                  backgroundColor: 'var(--color-brand-glow)',
                  color: 'var(--color-brand)',
                  border: '1px solid rgba(91,110,245,0.2)',
                }}
              >
                {profile.role}
              </span>
            </div>

            {profile.bio && (
              <p
                className="mx-auto mt-3 max-w-md text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {profile.bio}
              </p>
            )}

            <div
              className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {profile.location_city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {profile.location_city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatMemberSince(profile.created_at)}
              </span>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
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

            {/* Action buttons */}
            {!isOwnProfile && isAuthenticated && (
              <div className="mt-4 flex justify-center gap-2">
                {/* Report */}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Flag size={14} />}
                  onClick={() => setShowReport(true)}
                >
                  Report
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ═══ STATS ══════════════════════════════════════ */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Sales',
                value: formatCompactNumber(stats.total_sales),
                icon: ShoppingBag,
              },
              {
                label: 'Rating',
                value:
                  stats.average_rating > 0 && stats.total_reviews > 0
                    ? formatRating(stats.average_rating)
                    : 'New',
                icon: Star,
              },
              {
                label: 'Reviews',
                value: formatCompactNumber(stats.total_reviews),
                icon: Star,
              },
              {
                label: 'Followers',
                value: formatCompactNumber(stats.total_followers),
                icon: Users,
              },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* ═══ REVIEWS ════════════════════════════════════ */}
        {profile?.id && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UserReviewsSection userId={profile.id} />
          </motion.div>
        )}
      </div>

      {/* ═══ MODALS ═══════════════════════════════════════ */}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="user"
        targetId={profile?.id}
        targetName={profile?.username}
      />

      {/* Ban/Suspend Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanReason('');
        }}
        title="Take Action on User"
        description={`@${profile?.username} — Choose an action`}
        size="sm"
      >
        <div className="mt-4 space-y-4">
          <Input
            label="Reason (recommended)"
            placeholder="Why are you taking this action?"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowBanModal(false);
                setBanReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              isLoading={banMutation.isPending}
              loadingText="Suspending..."
              onClick={() =>
                banMutation.mutate({
                  status: 'suspended',
                  reason: banReason || 'Admin action',
                })
              }
              className="!bg-[var(--color-warning)] hover:!bg-[var(--color-warning)]"
            >
              Suspend
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={banMutation.isPending}
              loadingText="Banning..."
              onClick={() =>
                banMutation.mutate({
                  status: 'banned',
                  reason: banReason || 'Admin action',
                })
              }
            >
              Ban
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete this user?"
        description="This will permanently delete this user account, anonymize their data, and remove their listings. This cannot be undone."
        itemName={profile?.username}
        itemType="User"
        countdownSeconds={10}
      />
    </>
  );
}
