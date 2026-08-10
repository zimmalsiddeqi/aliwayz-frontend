import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordSchema } from '@lib/validators';
import AuthService from '@api/services/auth.service';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver:      zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess:  () => setSent(true),
    onError:    (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data) => mutation.mutate(data);

  if (sent) {
    return (
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
        </div>
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Check your email
          </h2>
          <p
            className="mt-2 text-sm max-w-xs mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            We sent a password reset link to{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {getValues('email')}
            </strong>
          </p>
        </div>
        <Link
          to="/login"
          className="btn-ghost inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back to login
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
          Forgot password?
        </h2>
        <p
          className="mt-1.5 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={mutation.isPending}
          loadingText="Sending..."
        >
          Send reset link
        </Button>
      </form>

      <p className="text-sm text-center">
        <Link
          to="/login"
          className="font-medium inline-flex items-center gap-1 transition-colors hover:underline"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </p>
    </motion.div>
  );
}