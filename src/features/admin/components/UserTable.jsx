import Avatar from '@components/ui/Avatar';
import BadgeUI from '@components/ui/Badge';
import Button from '@components/ui/Button';
import { Ban, ShieldCheck } from 'lucide-react';
import { formatDate } from '@utils/formatters';

export default function UserTable({ users, onStatusChange }) {
  if (!users.length) return null;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="card p-4 flex items-center gap-3">
          <Avatar src={u.avatar_url} name={u.username} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{u.username}</span>
              <BadgeUI size="xs" variant={u.account_status === 'active' ? 'success' : 'danger'} dot>{u.account_status}</BadgeUI>
              <BadgeUI size="xs">{u.role}</BadgeUI>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.email} · {formatDate(u.created_at)}</p>
          </div>
          <div className="flex gap-1">
            {u.account_status !== 'banned' && (
              <Button size="icon-sm" variant="ghost" onClick={() => onStatusChange(u.id, 'banned')}>
                <Ban size={14} style={{ color: 'var(--color-error)' }} />
              </Button>
            )}
            {u.account_status !== 'active' && (
              <Button size="icon-sm" variant="ghost" onClick={() => onStatusChange(u.id, 'active')}>
                <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}