import { ArrowUpDown } from 'lucide-react';
import Dropdown from '@components/ui/Dropdown';
import { SORT_OPTIONS } from '@utils/constants';

export default function SortDropdown({ value, onChange }) {
  const current = SORT_OPTIONS.find((s) => s.value === value);

  return (
    <Dropdown
      align="right"
      trigger={
        <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          <ArrowUpDown size={14} />
          {current?.label || 'Sort'}
        </span>
      }
      items={SORT_OPTIONS.map((opt) => ({
        label: opt.label,
        onClick: () => onChange(opt.value),
      }))}
    />
  );
}