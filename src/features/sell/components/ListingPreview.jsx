import { formatPrice } from '@utils/formatters';
import { getConditionLabel } from '@lib/utils';

export default function ListingPreview({ data, images = [] }) {
  const firstImage = images[0]?.preview;

  return (
    <div className="card overflow-hidden">
      {firstImage ? (
        <img src={firstImage} alt="" className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <span className="text-4xl opacity-20">📦</span>
        </div>
      )}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {data?.title || 'Product Title'}
        </h3>
        {data?.price && (
          <p className="font-bold text-lg text-gradient-brand">
            {formatPrice(data.price, data.currency || 'USD')}
          </p>
        )}
        {data?.condition && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}>
            {getConditionLabel(data.condition)}
          </span>
        )}
      </div>
    </div>
  );
}