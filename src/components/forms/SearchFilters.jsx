import { Controller } from 'react-hook-form';
import Select from '@components/ui/Select';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { CONDITIONS, SEARCH_SORT_OPTIONS } from '@utils/constants';

export default function SearchFilters({ control, register, onReset }) {
  return (
    <div className="space-y-4">
      <Select
        label="Sort By"
        options={SEARCH_SORT_OPTIONS}
        {...register('sort')}
      />
      <Select
        label="Condition"
        placeholder="Any Condition"
        options={CONDITIONS}
        {...register('condition')}
      />
      <div className="space-y-1.5">
        <label className="floating-label">Price Range</label>
        <div className="flex gap-2 items-center">
          <Input type="number" placeholder="Min" {...register('min_price')} />
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
          <Input type="number" placeholder="Max" {...register('max_price')} />
        </div>
      </div>
      <Input label="City" placeholder="Filter by city" {...register('city')} />
      <Button variant="ghost" size="sm" fullWidth onClick={onReset}>
        Clear Filters
      </Button>
    </div>
  );
}