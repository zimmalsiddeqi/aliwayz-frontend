import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  ShieldCheck, ShieldAlert, Clock, 
  ArrowRight, CheckCircle2, UserCheck, 
  ArrowLeft, Store 
} from 'lucide-react';
import VerificationService from '@api/services/verification.service';
import VerificationWizard from '../components/VerificationWizard';
import { queryKeys } from '@lib/queryClient';
import PageHeader from '@components/common/PageHeader';
import { Card } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import toast from '@lib/toast';
import { getErrorMessage } from '@lib/utils';
import { formatDate } from '@utils/formatters';

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const [inWizard, setInWizard] = useState(false);

  // Fetch current seller verification status
  const { data: statusData, isLoading } = useQuery({
    queryKey: queryKeys.verification.status(),
    queryFn: VerificationService.getStatus,
  });

  // Submit verification request mutation
  const submitMutation = useMutation({
    mutationFn: VerificationService.submitVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      toast.success('Identity verification request submitted successfully! 🚀');
      setInWizard(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const rawStatus = statusData?.data?.status;
  const status =
    rawStatus === 'approved' || rawStatus === 'identity_verified'
      ? 'identity_verified'
      : rawStatus || 'none';
  const latest_submission = statusData?.data?.latest_submission || null;

  const handleWizardSubmit = (formData) => {
    submitMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Helmet>
        <title>Identity Verification — Aliwayz</title>
      </Helmet>

      <PageHeader 
        showBack
        title="Seller Verification" 
        subtitle="Verify your identity to unlock store seller features."
      />

      {inWizard ? (
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="ghost" size="icon-sm" onClick={() => setInWizard(false)}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Identity Verification Wizard</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Complete the 4 steps to submit your ID documents</p>
            </div>
          </div>
          <VerificationWizard 
            onSubmit={handleWizardSubmit} 
            isSubmitting={submitMutation.isPending} 
          />
        </Card>
      ) : (
        <>
          {status === 'none' && (
            <div className="space-y-6">
              <Card variant="glass" className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 flex-shrink-0">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Store Identity Verification</h3>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      Identity verification is required for sellers who want to create a branded store. Casual sellers using Quick Listing do not need verification.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-b py-4" style={{ borderColor: 'var(--color-border)' }}>
                  {[
                    { title: 'Unlock Store Creation', desc: 'Build a store profile, set custom branding, and organize items into catalogs.' },
                    { title: 'Verified Seller Badge', desc: 'Display an official verification badge on your profile and listings.' },
                    { title: 'Quick Manual Review', desc: 'Secure evaluation completed in 1-2 business days.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="font-semibold text-theme-primary">Required: </span>
                    Valid U.S. government photo ID & selfie
                  </div>
                  <Button size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => setInWizard(true)} className="w-full sm:w-auto">
                    Start Verification
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {status === 'pending' && (
            <Card variant="glass" className="p-8 text-center space-y-6 border" style={{ borderColor: 'var(--color-warning)' }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <Clock size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Verification Under Review</h3>
                <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Your identity documents have been submitted and are being reviewed by our moderation team. Evaluation usually takes 1-2 business days.
                </p>
              </div>
              {latest_submission && (
                <div className="border-t pt-4 text-left max-w-xs mx-auto space-y-2 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Submitted:</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatDate(latest_submission.submitted_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>ID Type:</span>
                    <span className="font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>{latest_submission.id_type?.replace('_', ' ')}</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {status === 'identity_verified' && (
            <Card variant="glass" className="p-8 text-center space-y-6 border" style={{ borderColor: 'var(--color-success)' }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Identity Verified</h3>
                <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Your identity check has been approved. You now have full store creation privileges on Aliwayz.
                </p>
              </div>

              {latest_submission?.verified_at && (
                <div className="border-t pt-4 text-left max-w-xs mx-auto space-y-2 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Verified Date:</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatDate(latest_submission.verified_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Verified Badge:</span>
                    <span className="text-emerald-500 font-semibold">✓ Active</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button fullWidth onClick={() => window.location.href = '/store/create'}>
                  Proceed to Create Store
                </Button>
              </div>
            </Card>
          )}

          {status === 'rejected' && (
            <Card variant="glass" className="p-8 text-center space-y-6 border" style={{ borderColor: 'var(--color-error)' }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Verification Rejected</h3>
                <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Your identity verification request was not approved. Please review the reason below before resubmitting.
                </p>
              </div>

              {latest_submission?.rejection_reason && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left space-y-1">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Rejection Reason</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{latest_submission.rejection_reason}</p>
                </div>
              )}

              <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                <Button fullWidth onClick={() => setInWizard(true)}>
                  Resubmit Verification Documents
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
