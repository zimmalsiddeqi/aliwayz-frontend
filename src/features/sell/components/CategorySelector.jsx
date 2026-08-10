import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Select from '@components/ui/Select';

export default function CategorySelector({ control, name = 'category_id', error }) {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn:  () => CategoryService.getFlat().then((r) => r.data),
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          label="Category"
          placeholder="Select a category"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={error}
        />
      )}
    />
  );
}