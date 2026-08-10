import { cn } from '@lib/utils';

const FILTERS = [
  { value: '',              label: 'All' },
  { value: 'new_message',   label: 'Messages' },
  { value: 'product_sold',  label: 'Sales' },
  { value: 'review_received', label: 'Reviews' },
  { value: 'badge_earned',  label: 'Badges' },
];

export default function NotificationFilters({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn('flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all')}
          style={{
            backgroundColor: active === f.value ? 'var(--color-brand)' : 'var(--color-surface)',
            color:           active === f.value ? 'white' : 'var(--color-text-secondary)',
            border:          `1px solid ${active === f.value ? 'var(--color-brand)' : 'var(--color-border)'}`,
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}