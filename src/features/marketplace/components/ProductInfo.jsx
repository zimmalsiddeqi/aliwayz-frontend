import { MapPin, Clock, Eye, Heart } from 'lucide-react';
import BadgeUI from '@components/ui/Badge';
import { cn, formatPrice, formatRelativeTime, getConditionLabel, getConditionColor, getStatusColor } from '@lib/utils';
import { formatCompactNumber, formatDate } from '@utils/formatters';

export default function ProductInfo({ product }) {
  if (!product) return null;

  const details = [
    { label: 'Condition', value: getConditionLabel(product.condition) },
    { label: 'Brand',     value: product.brand },
    { label: 'Color',     value: product.color },
    { label: 'Quantity',  value: product.quantity },
    { label: 'Category',  value: product.categories?.name },
    { label: 'Listed',    value: formatDate(product.created_at) },
  ].filter((d) => d.value);

  return (
    <div className="space-y-5">
      {/* Status + Condition */}
      <div className="flex flex-wrap gap-2">
        <BadgeUI variant={product.status === 'available' ? 'success' : 'warning'} dot>
          {product.status}
        </BadgeUI>
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getConditionColor(product.condition))}>
          {getConditionLabel(product.condition)}
        </span>
        {product.is_featured && <BadgeUI variant="brand">⭐ Featured</BadgeUI>}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
        {product.title}
      </h1>

      {/* Price */}
      <p className="text-3xl font-bold text-gradient-brand">
        {formatPrice(product.price, product.currency)}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {product.location_city && (
          <span className="flex items-center gap-1"><MapPin size={14} />{product.location_city}</span>
        )}
        <span className="flex items-center gap-1"><Clock size={14} />{formatRelativeTime(product.created_at)}</span>
        <span className="flex items-center gap-1"><Eye size={14} />{formatCompactNumber(product.view_count)} views</span>
        <span className="flex items-center gap-1"><Heart size={14} />{formatCompactNumber(product.favorite_count)}</span>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-1.5">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Description</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Details grid */}
      {details.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{d.label}</p>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}