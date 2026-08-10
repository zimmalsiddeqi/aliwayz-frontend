import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordSchema } from '@lib/validators';
import AuthService from '@api/services/auth.service';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email, new_password: '' },
  });

  const mutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess:  () => setSuccess(true),
    onError:    (err) => toast.error(getErrorMessage(err)),
  });

  if (success) {
    return (
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}
        >
          <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
        </div>
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Password updated
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Your password has been reset successfully. You can now sign in.
          </p>
        </div>
        <Link to="/login" className="btn-brand inline-flex">
          Sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center lg:text-left">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Set new password
        </h2>
        <p
          className="mt-1.5 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <input type="hidden" {...register('token')} />
        <input type="hidden" {...register('email')} />

        <Input
          label="New Password"
          type="password"
          placeholder="Min 8 chars with uppercase, number, special"
          leftIcon={<Lock size={16} />}
          showPasswordToggle
          error={errors.new_password?.message}
          autoComplete="new-password"
          autoFocus
          {...register('new_password')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={mutation.isPending}
          loadingText="Updating..."
        >
          Reset password
        </Button>
      </form>

      <p className="text-sm text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-medium hover:underline"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </p>
    </motion.div>
  );
}