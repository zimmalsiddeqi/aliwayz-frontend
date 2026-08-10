import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { loginSchema } from '@lib/validators';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function LoginForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:     zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock size={16} />} showPasswordToggle error={errors.password?.message} {...register('password')} />
      <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Signing in...">Sign In</Button>
    </form>
  );
}