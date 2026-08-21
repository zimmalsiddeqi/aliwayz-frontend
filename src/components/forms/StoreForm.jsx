import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStoreSchema } from '@lib/validators';
import { CATEGORY_IDS } from '@utils/constants';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';

const STORE_CATEGORIES = [
  { value: CATEGORY_IDS.AUTOMOTIVE, label: 'Automotive' },
  { value: CATEGORY_IDS.PROPERTY, label: 'Real Estate' },
  { value: CATEGORY_IDS.OTHER, label: 'Marketplace' },
];

export default function StoreForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save' }) {
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
        options={STORE_CATEGORIES}
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