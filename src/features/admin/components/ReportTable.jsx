import { CheckCircle, XCircle, Flag } from 'lucide-react';
import BadgeUI from '@components/ui/Badge';
import { formatRelativeTime } from '@utils/formatters';

export default function ReportTable({ reports, onResolve, onDismiss }) {
  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div key={report.id} className="card p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Flag size={14} style={{ color: 'var(--color-error)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>{report.reason}</span>
              <BadgeUI size="xs">{report.target_type}</BadgeUI>
              <BadgeUI size="xs" variant={report.status === 'pending' ? 'warning' : 'success'}>{report.status}</BadgeUI>
            </div>
            {report.description && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{report.description}</p>
            )}
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              By @{report.reporter?.username} · {formatRelativeTime(report.created_at)}
            </p>
          </div>
          {report.status === 'pending' && (
            <div className="flex gap-1">
              <button onClick={() => onResolve(report.id)} className="p-1.5 rounded-lg hover:bg-green-500/10" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={16} />
              </button>
              <button onClick={() => onDismiss(report.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: 'var(--color-text-muted)' }}>
                <XCircle size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}