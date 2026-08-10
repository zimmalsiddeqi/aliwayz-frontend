import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createProductSchema } from '@lib/validators';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import { CONDITIONS } from '@utils/constants';

export default function ProductForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Publish' }) {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn:  () => CategoryService.getFlat().then((r) => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:      zodResolver(createProductSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea label="Description" maxLength={5000} error={errors.description?.message} {...register('description')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Price" type="number" error={errors.price?.message} {...register('price')} leftIcon={<span className="text-xs font-mono">$</span>} />
        <Select label="Condition" placeholder="Select" options={CONDITIONS} error={errors.condition?.message} {...register('condition')} />
      </div>
      <Select label="Category" placeholder="Select category" options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.category_id?.message} {...register('category_id')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Brand (optional)" {...register('brand')} />
        <Input label="Color (optional)" {...register('color')} />
      </div>
      <Input label="City" {...register('location_city')} />
      <Button type="submit" fullWidth isLoading={isLoading} loadingText="Saving...">{submitLabel}</Button>
    </form>
  );
}