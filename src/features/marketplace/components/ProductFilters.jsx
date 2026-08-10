import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Select from '@components/ui/Select';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { CONDITIONS } from '@utils/constants';

export default function ProductFilters({ onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn:  () => CategoryService.getFlat().then((r) => r.data),
  });

  const update = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const clear = () => { setSearchParams({}); onClose?.(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <SlidersHorizontal size={16} /> Filters
        </h3>
        <button onClick={clear} className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>Clear all</button>
      </div>

      <Select label="Category" placeholder="All" value={searchParams.get('category_id') || ''} onChange={(e) => update('category_id', e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
      <Select label="Condition" placeholder="Any" value={searchParams.get('condition') || ''} onChange={(e) => update('condition', e.target.value)} options={CONDITIONS} />

      <div className="space-y-1.5">
        <label className="floating-label">Price Range</label>
        <div className="flex gap-2">
          <Input type="number" placeholder="Min" value={searchParams.get('min_price') || ''} onChange={(e) => update('min_price', e.target.value)} />
          <span className="flex items-center" style={{ color: 'var(--color-text-muted)' }}>—</span>
          <Input type="number" placeholder="Max" value={searchParams.get('max_price') || ''} onChange={(e) => update('max_price', e.target.value)} />
        </div>
      </div>

      <Input label="City" placeholder="Filter by city" value={searchParams.get('city') || ''} onChange={(e) => update('city', e.target.value)} />

      {onClose && <Button fullWidth onClick={onClose}>Show Results</Button>}
    </div>
  );
}