import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import BadgeUI from '@components/ui/Badge';
import { ShieldCheck } from 'lucide-react';
import { formatRating } from '@utils/formatters';

export default function StoreTable({ stores, onVerify }) {
  return (
    <div className="space-y-2">
      {stores.map((store) => (
        <div key={store.id} className="card p-4 flex items-center gap-3">
          <Avatar src={store.logo_url} name={store.store_name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{store.store_name}</span>
              {store.is_verified && <BadgeUI size="xs" variant="success">Verified</BadgeUI>}
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>★ {formatRating(store.average_rating)} · @{store.users?.username}</p>
          </div>
          <Button size="icon-sm" variant={store.is_verified ? 'outline' : 'brand'} onClick={() => onVerify(store.id, !store.is_verified)}>
            <ShieldCheck size={14} />
          </Button>
        </div>
      ))}
    </div>
  );
}