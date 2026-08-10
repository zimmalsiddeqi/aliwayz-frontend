import { ShoppingBag, Star, Users, Heart } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { formatCompactNumber, formatRating } from '@utils/formatters';

export default function ProfileStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Sales',     value: formatCompactNumber(stats.total_sales),    icon: ShoppingBag, color: 'var(--color-brand)' },
        { label: 'Rating',    value: formatRating(stats.average_rating),        icon: Star,        color: 'var(--color-warning)' },
        { label: 'Reviews',   value: formatCompactNumber(stats.total_reviews),  icon: Star,        color: '#8B5CF6' },
        { label: 'Followers', value: formatCompactNumber(stats.total_followers), icon: Users,       color: 'var(--color-info)' },
      ].map((s) => (
        <Card key={s.label} className="p-4 text-center">
          <s.icon size={18} className="mx-auto mb-1.5" style={{ color: s.color }} />
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{s.value}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
        </Card>
      ))}
    </div>
  );
}