import { Star, ShoppingBag, Users, Package } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { formatRating, formatCompactNumber } from '@utils/formatters';

export default function StoreStats({ store }) {
  const stats = [
    { label: 'Rating',    value: formatRating(store.average_rating),              icon: Star,       color: 'var(--color-warning)' },
    { label: 'Sales',     value: formatCompactNumber(store.total_sales),           icon: ShoppingBag, color: 'var(--color-success)' },
    { label: 'Followers', value: formatCompactNumber(store.total_followers),       icon: Users,      color: 'var(--color-info)' },
    { label: 'Reviews',   value: formatCompactNumber(store.total_reviews),         icon: Star,       color: '#8B5CF6' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-3 text-center">
          <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
          <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{s.value}</p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
        </Card>
      ))}
    </div>
  );
}