import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createStoreSchema } from '@lib/validators';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';

export default function StoreForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save' }) {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn:  () => CategoryService.getFlat().then((r) => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:     zodResolver(createStoreSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Store Name" error={errors.store_name?.message} {...register('store_name')} />
      <Textarea label="Description" maxLength={1000} error={errors.description?.message} {...register('description')} />
      <Select
        label="Category"
        placeholder="Select category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        error={errors.category_id?.message}
        {...register('category_id')}
      />
      <Input label="City" error={errors.location_city?.message} {...register('location_city')} />
      <Input label="Instagram" placeholder="https://instagram.com/..." {...register('social_instagram')} />
      <Input label="Facebook" placeholder="https://facebook.com/..." {...register('social_facebook')} />
      <Input label="TikTok" placeholder="https://tiktok.com/@..." {...register('social_tiktok')} />
      <Button type="submit" fullWidth isLoading={isLoading} loadingText="Saving...">{submitLabel}</Button>
    </form>
  );
}