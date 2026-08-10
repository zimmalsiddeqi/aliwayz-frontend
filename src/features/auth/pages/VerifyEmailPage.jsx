import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import AuthService from '@api/services/auth.service';
import useAuthStore from '@store/auth.store';
import Button from '@components/ui/Button';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const token = searchParams.get('token');
  const email = searchParams.get('email') || user?.email || '';

  const [verified, setVerified] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: () => AuthService.verifyEmail({ token, email }),
    onSuccess:  () => {
      setVerified(true);
      setUser({ email_verified: true });
      toast.success('Email verified!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const resendMutation = useMutation({
    mutationFn: () => AuthService.resendVerification({ email }),
    onSuccess:  () => toast.success('Verification email sent!'),
    onError:    (err) => toast.error(getErrorMessage(err)),
  });

  // Auto-verify if token exists in URL
  if (token && !verified && !verifyMutation.isPending && !verifyMutation.isError) {
    verifyMutation.mutate();
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
           style={{ backgroundColor: 'var(--color-bg)' }}>
        <motion.div
          className="text-center space-y-6 max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}
          >
            <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Email verified!
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Your email has been verified successfully.
          </p>
          <Link to="/" className="btn-brand inline-flex">
            Go to Marketplace
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ backgroundColor: 'var(--color-bg)' }}>
      <motion.div
        className="text-center space-y-6 max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ backgroundColor: 'rgba(91,110,245,0.1)' }}
        >
          <Mail size={32} style={{ color: 'var(--color-brand)' }} />
        </div>

        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Verify your email
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            We sent a verification link to{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
          </p>
        </div>

        <div className="glass-card p-4 space-y-3">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Didn&apos;t receive the email? Check spam or click below.
          </p>
          <Button
            variant="ghost"
            size="sm"
            isLoading={resendMutation.isPending}
            loadingText="Sending..."
            leftIcon={<RefreshCw size={14} />}
            onClick={() => resendMutation.mutate()}
          >
            Resend verification email
          </Button>
        </div>

        <Link
          to="/"
          className="text-xs font-medium hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip for now →
        </Link>
      </motion.div>
    </div>
  );
}