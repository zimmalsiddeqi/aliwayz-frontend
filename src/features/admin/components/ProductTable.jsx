import Button from '@components/ui/Button';
import { Star, Trash2 } from 'lucide-react';
import { formatPrice } from '@utils/formatters';
import { getStatusColor, cn } from '@lib/utils';

export default function ProductTable({ products, onFeature, onDelete }) {
  return (
    <div className="space-y-2">
      {products.map((p) => (
        <div key={p.id} className="card p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{p.title}</span>
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize', getStatusColor(p.status))}>{p.status}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatPrice(p.price, p.currency)} · @{p.users?.username}</p>
          </div>
          <Button size="icon-sm" variant="ghost" onClick={() => onFeature(p.id, !p.is_featured)}>
            <Star size={14} fill={p.is_featured ? 'var(--color-warning)' : 'none'} style={{ color: 'var(--color-warning)' }} />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onDelete(p.id)}>
            <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
          </Button>
        </div>
      ))}
    </div>
  );
}