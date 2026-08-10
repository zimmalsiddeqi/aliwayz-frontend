import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import { Card } from '@components/ui/Card';
import BadgeUI from '@components/ui/Badge';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import usePagination from '@hooks/usePagination';
import { formatRelativeTime } from '@utils/formatters';

export default function AdminLogsPage() {
  const { page, limit, nextPage, prevPage } = usePagination(1, 30);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.logs({ page, limit }),
    queryFn:  () => AdminService.getLogs({ page, limit }),
  });

  const logs       = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <Helmet><title>Admin Logs — Aliwayz</title></Helmet>
      <PageHeader title="Admin Logs" subtitle="Audit trail" />

      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : logs.length === 0 ? <EmptyState icon="📋" title="No logs" /> : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{log.action}</span>
                      {log.target_type && <BadgeUI size="xs">{log.target_type}</BadgeUI>}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      by @{log.admin?.username} · {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {pagination?.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={prevPage}>Previous</Button>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{pagination.page}/{pagination.total_pages}</span>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={nextPage}>Next</Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}