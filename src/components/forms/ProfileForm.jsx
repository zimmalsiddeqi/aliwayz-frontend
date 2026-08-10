import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@lib/validators';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';

export default function ProfileForm({ defaultValues, onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:     zodResolver(updateProfileSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Username" error={errors.username?.message} {...register('username')} />
      <Textarea label="Bio" maxLength={500} error={errors.bio?.message} {...register('bio')} />
      <Button type="submit" fullWidth isLoading={isLoading} loadingText="Saving...">
        Save Changes
      </Button>
    </form>
  );
}