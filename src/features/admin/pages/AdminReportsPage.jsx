import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Flag } from 'lucide-react';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import BadgeUI from '@components/ui/Badge';
import Button from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import usePagination from '@hooks/usePagination';
import { cn, getErrorMessage } from '@lib/utils';
import { formatRelativeTime } from '@utils/formatters';
import toast from '@lib/toast';

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const [statusFilter, setFilter] = useState('pending');
  const { page, limit, nextPage, prevPage } = usePagination(1, 20);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.reports({ status: statusFilter, page, limit }),
    queryFn: () => AdminService.getReports({ status: statusFilter || undefined, page, limit }),
  });

  const reports = data?.data || [];
  const pagination = data?.pagination;

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status, note }) => {
      // Resolve the report
      await AdminService.resolveReport(id, {
        status,
        resolution_note: note,
      });

      // If resolved (not dismissed), check if target needs action
      if (status === 'resolved') {
        const report = reports.find((r) => r.id === id);
        if (report) {
          // Check total resolved reports against this target
          const allReports = await AdminService.getReports({
            target_type: report.target_type,
            target_id: report.target_id,
            status: 'resolved',
            page: 1,
            limit: 100,
          });

          const resolvedCount = allReports?.data?.length || 0;

          // Auto-suspend user/store after 3+ resolved reports
          if (resolvedCount >= 3 && report.target_type === 'user') {
            await AdminService.updateUserStatus(report.target_id, {
              status: 'suspended',
              reason: `Auto-suspended: ${resolvedCount} resolved reports`,
            });
            toast.success(`User auto-suspended (${resolvedCount} reports)`);
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['admin', 'reports'],
      });
      toast.success('Report resolved');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Helmet>
        <title>Reports — Admin — Aliwayz</title>
      </Helmet>

      <PageHeader title="Reports" subtitle={`${pagination?.total || 0} total`} />

      <div className="mb-6 flex gap-2">
        {['pending', 'resolved', 'dismissed', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all"
            style={{
              backgroundColor: statusFilter === s ? 'var(--color-brand)' : 'var(--color-surface)',
              color: statusFilter === s ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${statusFilter === s ? 'var(--color-brand)' : 'var(--color-border)'}`,
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon="🎉" title="No reports" description="All clear!" />
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                  >
                    <Flag size={14} style={{ color: 'var(--color-error)' }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-sm font-semibold capitalize"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {report.reason}
                      </span>
                      <BadgeUI size="xs" variant="default">
                        {report.target_type}
                      </BadgeUI>
                      <BadgeUI
                        size="xs"
                        variant={
                          report.status === 'pending'
                            ? 'warning'
                            : report.status === 'resolved'
                              ? 'success'
                              : 'default'
                        }
                      >
                        {report.status}
                      </BadgeUI>
                    </div>

                    {report.description && (
                      <p
                        className="mt-1 line-clamp-2 text-xs"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {report.description}
                      </p>
                    )}

                    <div
                      className="mt-2 flex items-center gap-3 text-[11px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <span>By @{report.reporter?.username}</span>
                      <span>{formatRelativeTime(report.created_at)}</span>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        onClick={() =>
                          resolveMutation.mutate({ id: report.id, status: 'resolved' })
                        }
                        className="rounded-lg p-2 transition-colors hover:bg-green-500/10"
                        style={{ color: 'var(--color-success)' }}
                        title="Resolve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          resolveMutation.mutate({ id: report.id, status: 'dismissed' })
                        }
                        className="rounded-lg p-2 transition-colors hover:bg-red-500/10"
                        style={{ color: 'var(--color-text-muted)' }}
                        title="Dismiss"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={prevPage}
              >
                Previous
              </Button>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={nextPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
