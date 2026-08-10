import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Star, MessageSquare, Trash2, Reply,
  CheckCircle, X, Eye,
} from 'lucide-react';
import FeedbackService from '@api/services/feedback.service';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import Textarea from '@components/ui/Textarea';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import { cn, getErrorMessage } from '@lib/utils';
import { formatRelativeTime, formatDate } from '@utils/formatters';
import toast from '@lib/toast';

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'unread',    label: '🔵 Unread' },
  { value: 'read',      label: '👁️ Read' },
  { value: 'responded', label: '✅ Responded' },
  { value: 'archived',  label: '📦 Archived' },
];

const TYPE_ICONS = {
  feedback:   '💬',
  suggestion: '💡',
  bug:        '🐛',
  praise:     '🎉',
  complaint:  '😤',
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [replyTarget, setReplyTarget]   = useState(null);
  const [replyText, setReplyText]       = useState('');
  const [selectedFeedback, setSelected] = useState(null);
  const limit = 20;

  // Fetch feedback
  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback', statusFilter, page],
    queryFn:  () =>
      FeedbackService.getAll({
        status: statusFilter || undefined,
        page,
        limit,
      }),
  });

  const feedbacks  = data?.data || [];
  const pagination = data?.pagination;

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: (id) =>
      FeedbackService.update(id, { status: 'read' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-feedback'],
      });
    },
  });

  // Reply
  const replyMutation = useMutation({
    mutationFn: () =>
      FeedbackService.update(replyTarget.id, {
        admin_reply: replyText.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-feedback'],
      });
      setReplyTarget(null);
      setReplyText('');
      toast.success('Reply sent');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Archive
  const archiveMutation = useMutation({
    mutationFn: (id) =>
      FeedbackService.update(id, {
        status: 'archived',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-feedback'],
      });
      toast.success('Archived');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => FeedbackService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-feedback'],
      });
      toast.success('Deleted');
    },
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'unread':
        return {
          bg:    'rgba(59,130,246,0.1)',
          color: '#3B82F6',
        };
      case 'read':
        return {
          bg:    'var(--color-surface-elevated)',
          color: 'var(--color-text-muted)',
        };
      case 'responded':
        return {
          bg:    'rgba(16,185,129,0.1)',
          color: 'var(--color-success)',
        };
      case 'archived':
        return {
          bg:    'var(--color-surface-elevated)',
          color: 'var(--color-text-muted)',
        };
      default:
        return {
          bg:    'var(--color-surface-elevated)',
          color: 'var(--color-text-muted)',
        };
    }
  };

  return (
    <>
      <Helmet>
        <title>Feedback — Admin — Aliwayz</title>
      </Helmet>

      <div className="space-y-5">
        <PageHeader
          title="User Feedback"
          subtitle={`${pagination?.total || 0} submissions`}
        />

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor:
                  statusFilter === tab.value
                    ? 'var(--color-brand)'
                    : 'var(--color-surface)',
                color:
                  statusFilter === tab.value
                    ? 'white'
                    : 'var(--color-text-secondary)',
                border: `1px solid ${
                  statusFilter === tab.value
                    ? 'var(--color-brand)'
                    : 'var(--color-border)'
                }`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : feedbacks.length === 0 ? (
          <EmptyState
            icon="💭"
            title="No feedback yet"
            description="User feedback will appear here."
          />
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb, i) => {
              const statusStyle = getStatusStyle(fb.status);
              const fbUser      = fb.users;

              return (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={cn(
                      'p-4',
                      fb.status === 'unread' &&
                        'ring-1'
                    )}
                    style={{
                      ringColor:
                        fb.status === 'unread'
                          ? '#3B82F6'
                          : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <span className="text-xl flex-shrink-0 mt-0.5">
                        {TYPE_ICONS[fb.type] || '💬'}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* User info */}
                          {fbUser ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                src={fbUser.avatar_url}
                                name={fbUser.username}
                                size="xs"
                              />
                              <span
                                className="text-xs font-semibold"
                                style={{
                                  color:
                                    'var(--color-text-primary)',
                                }}
                              >
                                @{fbUser.username}
                              </span>
                            </div>
                          ) : (
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  'var(--color-text-primary)',
                              }}
                            >
                              {fb.name || 'Anonymous'}
                            </span>
                          )}

                          {/* Status */}
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
                            style={{
                              backgroundColor:
                                statusStyle.bg,
                              color:
                                statusStyle.color,
                            }}
                          >
                            {fb.status}
                          </span>

                          {/* Type */}
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize"
                            style={{
                              backgroundColor:
                                'var(--color-surface-elevated)',
                              color:
                                'var(--color-text-muted)',
                            }}
                          >
                            {fb.type}
                          </span>

                          {/* Rating */}
                          {fb.rating && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({
                                length: fb.rating,
                              }).map((_, s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  fill="var(--color-warning)"
                                  style={{
                                    color:
                                      'var(--color-warning)',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            color:
                              'var(--color-text-secondary)',
                          }}
                        >
                          {fb.message}
                        </p>

                        {/* Email if provided */}
                        {fb.email && (
                          <p
                            className="text-[11px] mt-1"
                            style={{
                              color:
                                'var(--color-text-muted)',
                            }}
                          >
                            ✉ {fb.email}
                          </p>
                        )}

                        {/* Admin reply */}
                        {fb.admin_reply && (
                          <div
                            className="mt-3 p-3 rounded-xl text-xs"
                            style={{
                              backgroundColor:
                                'rgba(16,185,129,0.05)',
                              border:
                                '1px solid rgba(16,185,129,0.15)',
                            }}
                          >
                            <p
                              className="font-semibold mb-1"
                              style={{
                                color:
                                  'var(--color-success)',
                              }}
                            >
                              Admin Reply:
                            </p>
                            <p
                              style={{
                                color:
                                  'var(--color-text-secondary)',
                              }}
                            >
                              {fb.admin_reply}
                            </p>
                          </div>
                        )}

                        {/* Time */}
                        <p
                          className="text-[11px] mt-2"
                          style={{
                            color:
                              'var(--color-text-muted)',
                          }}
                        >
                          {formatRelativeTime(
                            fb.created_at
                          )}{' '}
                          ·{' '}
                          {formatDate(
                            fb.created_at
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {fb.status === 'unread' && (
                          <button
                            onClick={() =>
                              markReadMutation.mutate(
                                fb.id
                              )
                            }
                            className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/10"
                            style={{
                              color: '#3B82F6',
                            }}
                            title="Mark as read"
                          >
                            <Eye size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReplyTarget(fb);
                            setReplyText('');
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-green-500/10"
                          style={{
                            color:
                              'var(--color-success)',
                          }}
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>

                        <button
                          onClick={() =>
                            archiveMutation.mutate(
                              fb.id
                            )
                          }
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)]"
                          style={{
                            color:
                              'var(--color-text-muted)',
                          }}
                          title="Archive"
                        >
                          <CheckCircle
                            size={14}
                          />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              confirm('Delete?')
                            )
                              deleteMutation.mutate(
                                fb.id
                              );
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                          style={{
                            color:
                              'var(--color-error)',
                          }}
                          title="Delete"
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
                    disabled={
                      !pagination.has_prev
                    }
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
                    {pagination.page} /{' '}
                    {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      !pagination.has_next
                    }
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

      {/* Reply Modal */}
      <Modal
        isOpen={!!replyTarget}
        onClose={() => {
          setReplyTarget(null);
          setReplyText('');
        }}
        title="Reply to Feedback"
        size="sm"
      >
        {replyTarget && (
          <div className="space-y-4 mt-4">
            <div
              className="p-3 rounded-xl text-xs"
              style={{
                backgroundColor:
                  'var(--color-surface-elevated)',
                border:
                  '1px solid var(--color-border)',
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{
                  color:
                    'var(--color-text-primary)',
                }}
              >
                Original message:
              </p>
              <p
                style={{
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                {replyTarget.message}
              </p>
            </div>

            <Textarea
              label="Your reply"
              placeholder="Write your response..."
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value)
              }
              maxLength={2000}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setReplyTarget(null);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                disabled={
                  !replyText.trim()
                }
                isLoading={
                  replyMutation.isPending
                }
                loadingText="Sending..."
                leftIcon={<Reply size={16} />}
                onClick={() =>
                  replyMutation.mutate()
                }
              >
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}