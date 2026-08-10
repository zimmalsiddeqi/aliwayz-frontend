import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Textarea from '@components/ui/Textarea';
import ReportService from '@api/services/report.service';
import useAuthStore from '@store/auth.store';
import { cn, getErrorMessage } from '@lib/utils';
import { REPORT_REASONS } from '@utils/constants';
import toast from '@lib/toast';

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}) {
  const { isAuthenticated } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      ReportService.create({
        target_type: targetType,
        target_id: targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.includes('already reported')) {
        toast.error(
          'You have already reported this. Our team is reviewing it.'
        );
        onClose();
      } else {
        toast.error(msg);
      }
    },
  });

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  if (!isAuthenticated) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Report"
        size="sm"
      >
        <div className="text-center py-6">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Please log in to submit a report.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              onClose();
              window.location.href = '/login';
            }}
          >
            Log In
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? undefined : `Report ${targetType}`}
      description={
        submitted
          ? undefined
          : 'Help us keep the community safe'
      }
      size="sm"
    >
      {submitted ? (
        <motion.div
          className="text-center py-6 space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(16,185,129,0.15)',
            }}
          >
            <CheckCircle
              size={32}
              style={{ color: 'var(--color-success)' }}
            />
          </div>
          <div>
            <h3
              className="text-lg font-bold"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              Report Submitted
            </h3>
            <p
              className="text-sm mt-1"
              style={{
                color: 'var(--color-text-secondary)',
              }}
            >
              Thank you for helping us keep the community
              safe. Our team will review this report.
            </p>
          </div>
          <Button fullWidth onClick={handleClose}>
            Done
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-5 mt-4">
          {/* Target info */}
          {targetName && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                backgroundColor:
                  'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Flag
                size={16}
                style={{ color: 'var(--color-error)' }}
              />
              <div>
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Reporting {targetType}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {targetName}
                </p>
              </div>
            </div>
          )}

          {/* Reason selection */}
          <div className="space-y-2">
            <label className="floating-label">
              Why are you reporting this? *
            </label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() =>
                    setSelectedReason(reason.value)
                  }
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200'
                  )}
                  style={{
                    backgroundColor:
                      selectedReason === reason.value
                        ? 'rgba(239,68,68,0.1)'
                        : 'var(--color-surface)',
                    border: `1px solid ${
                      selectedReason === reason.value
                        ? 'var(--color-error)'
                        : 'var(--color-border)'
                    }`,
                    color:
                      selectedReason === reason.value
                        ? 'var(--color-error)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor:
                        selectedReason === reason.value
                          ? 'var(--color-error)'
                          : 'var(--color-border)',
                    }}
                  >
                    {selectedReason === reason.value && (
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            'var(--color-error)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                  </div>
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <Textarea
            label="Additional details (optional)"
            placeholder="Provide more context to help our team..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />

          {/* Warning */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{
              backgroundColor: 'rgba(245,158,11,0.08)',
              border:
                '1px solid rgba(245,158,11,0.15)',
              color: 'var(--color-warning)',
            }}
          >
            <AlertTriangle
              size={14}
              className="flex-shrink-0 mt-0.5"
            />
            <span>
              False reports may result in action against
              your account. Only report genuine violations.
            </span>
          </div>

          {/* Submit */}
          <Button
            fullWidth
            variant="danger"
            disabled={!selectedReason}
            isLoading={mutation.isPending}
            loadingText="Submitting..."
            leftIcon={<Flag size={16} />}
            onClick={() => mutation.mutate()}
          >
            Submit Report
          </Button>
        </div>
      )}
    </Modal>
  );
}