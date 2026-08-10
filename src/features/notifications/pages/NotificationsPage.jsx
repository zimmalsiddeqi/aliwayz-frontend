import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import NotificationService from '@api/services/notification.service';
import { queryKeys } from '@lib/queryClient';
import useNotificationStore from '@store/notification.store';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import { cn, getNotificationIcon, formatRelativeTime } from '@lib/utils';

const FILTER_TABS = [
  { value: '',                label: 'All' },
  { value: 'new_message',     label: '💬 Messages' },
  { value: 'product_sold',    label: '🎉 Sales' },
  { value: 'review_received', label: '⭐ Reviews' },
  { value: 'new_follower',    label: '👥 Followers' },
  { value: 'price_update',    label: '📉 Price Drops' },
  { value: 'badge_earned',    label: '🏆 Badges' },
];

export default function NotificationsPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const {
    unreadCount,
    markAsRead:       storeMarkAsRead,
    markAllAsRead:    storeMarkAllAsRead,
    setNotifications: storeSetNotifications,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState('');

  // ✅ FIX: useQuery MUST be declared BEFORE useEffect
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn:  () =>
      NotificationService.getAll({ page: 1, limit: 100 }),
    refetchInterval: 30000,
  });

  // ✅ FIX: useEffect AFTER useQuery so `data` is defined
  useEffect(() => {
    if (data?.data) {
      storeSetNotifications(data.data, data.unread_count);
    }
  }, [data]);

  const notifications = data?.data || [];

  const filtered = activeFilter
    ? notifications.filter((n) => n.type === activeFilter)
    : notifications;

  const unreadFiltered = filtered.filter(
    (n) => !n.is_read
  ).length;

  const readMutation = useMutation({
    mutationFn: (id) =>
      NotificationService.markAsRead(id),
    onSuccess: (_, id) => {
      storeMarkAsRead(id);
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () =>
      NotificationService.markAllAsRead(),
    onSuccess: () => {
      storeMarkAllAsRead();
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      });
    },
  });

  const handleClick = (notif) => {
    if (!notif.is_read) {
      readMutation.mutate(notif.id);
    }
    const d = notif.data || {};
    if (d.conversationId)
      navigate(`/inbox/${d.conversationId}`);
    else if (d.productId)
      navigate(`/product/${d.productId}`);
    else if (d.storeSlug)
      navigate(`/store/${d.storeSlug}`);
  };

  return (
    <>
      <Helmet>
        <title>Notifications — Aliwayz</title>
      </Helmet>

      <div className="container-app max-w-2xl py-4 pb-24 sm:py-6 md:pb-8">
        <PageHeader
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up!'
          }
          rightAction={
            unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CheckCheck size={14} />}
                isLoading={readAllMutation.isPending}
                onClick={() => readAllMutation.mutate()}
              >
                Mark all read
              </Button>
            )
          }
        />

        {/* Filter tabs */}
        <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === ''
                ? notifications.length
                : notifications.filter(
                    (n) => n.type === tab.value
                  ).length;

            const unreadInTab =
              tab.value === ''
                ? unreadFiltered
                : notifications.filter(
                    (n) =>
                      n.type === tab.value &&
                      !n.is_read
                  ).length;

            return (
              <button
                key={tab.value}
                onClick={() =>
                  setActiveFilter(tab.value)
                }
                className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    activeFilter === tab.value
                      ? 'var(--color-brand)'
                      : 'var(--color-surface)',
                  color:
                    activeFilter === tab.value
                      ? 'white'
                      : 'var(--color-text-secondary)',
                  border: `1px solid ${
                    activeFilter === tab.value
                      ? 'var(--color-brand)'
                      : 'var(--color-border)'
                  }`,
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor:
                        activeFilter === tab.value
                          ? 'rgba(255,255,255,0.3)'
                          : unreadInTab > 0
                            ? 'var(--color-error)'
                            : 'var(--color-surface-elevated)',
                      color:
                        activeFilter === tab.value ||
                        unreadInTab > 0
                          ? 'white'
                          : 'var(--color-text-muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={
              activeFilter
                ? getNotificationIcon(activeFilter)
                : '🔔'
            }
            title={
              activeFilter
                ? 'No notifications in this category'
                : 'No notifications yet'
            }
            description="You're all caught up!"
          />
        ) : (
          <AnimatePresence>
            <div className="space-y-1">
              {filtered.map((notif, i) => (
                <motion.button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:bg-[var(--glass-bg-strong)] sm:p-4',
                    !notif.is_read &&
                      'bg-[var(--glass-bg)]'
                  )}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span className="mt-0.5 flex-shrink-0 text-xl">
                    {getNotificationIcon(notif.type)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        !notif.is_read
                          ? 'font-semibold'
                          : 'font-normal'
                      )}
                      style={{
                        color:
                          'var(--color-text-primary)',
                      }}
                    >
                      {notif.title}
                    </p>
                    <p
                      className="mt-0.5 line-clamp-2 text-xs"
                      style={{
                        color:
                          'var(--color-text-secondary)',
                      }}
                    >
                      {notif.body}
                    </p>
                    <p
                      className="mt-1 text-[11px]"
                      style={{
                        color:
                          'var(--color-text-muted)',
                      }}
                    >
                      {formatRelativeTime(
                        notif.created_at
                      )}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <motion.div
                      className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          'var(--color-brand)',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
}