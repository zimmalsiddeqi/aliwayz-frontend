import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User } from 'lucide-react';
import { registerSchema } from '@lib/validators';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function RegisterForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:     zodResolver(registerSchema),
    defaultValues: { email: '', password: '', username: '', full_name: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full Name" placeholder="John Doe" leftIcon={<User size={16} />} error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Username" placeholder="johndoe" error={errors.username?.message} {...register('username')} />
      <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" showPasswordToggle leftIcon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
      <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Creating...">Create Account</Button>
    </form>
  );
}