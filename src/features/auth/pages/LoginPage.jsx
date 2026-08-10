import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginSchema } from '@lib/validators';
import useAuth from '@hooks/useAuth';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Separator from '@components/ui/Separator';
import { setFormErrors } from '@utils/helpers';
import GoogleButton from '@components/ui/GoogleButton';
import useOAuth from '@features/auth/hooks/useOAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const { triggerGoogleLogin, isLoading: isGoogleLoading } = useOAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // ✅ No redirectTo needed — useAuth handles it based on role
      await login(data);
    } catch (error) {
      setFormErrors(error, setError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile logo */}
      <div className="text-center lg:text-left">
        <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              boxShadow: 'var(--shadow-brand)',
            }}
          >
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <span className="text-gradient-brand text-xl font-bold">Aliwayz</span>
        </div>

        <h2
          className="text-2xl font-bold sm:text-3xl"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Sign in to continue buying and selling locally
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={<Lock size={16} />}
          showPasswordToggle
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium hover:underline"
            style={{ color: 'var(--color-brand)' }}
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Signing in...">
          Sign in
        </Button>
      </form>

      <Separator label="or" />

      {/* Google Sign-in */}
      <GoogleButton
        onClick={triggerGoogleLogin}
        isLoading={isGoogleLoading}
      />

      {/* Sign up link */}
      <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold hover:underline"
          style={{ color: 'var(--color-brand)' }}
        >
          Create account
        </Link>
      </p>
    </motion.div>
  );
}
