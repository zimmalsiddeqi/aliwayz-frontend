import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ExternalLink, Check } from 'lucide-react';
import useAuthStore from '@store/auth.store';
import LegalService from '@api/services/legal.service';
import Button from '@components/ui/Button';
import toast from '@lib/toast';
import { POLICY_EFFECTIVE_DATE, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '../../../config/legal.config';

export default function LegalConsentModal() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Show modal only if user is authenticated and explicitly missing current legal consent
    if (isAuthenticated && user && user.has_current_consent === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user?.has_current_consent, user?.id]);

  const handleAccept = async () => {
    if (!agreed) {
      toast.error('Please check the box to confirm your agreement.');
      return;
    }

    setIsSubmitting(true);
    try {
      await LegalService.recordConsent({
        terms_version: CURRENT_TERMS_VERSION,
        privacy_version: CURRENT_PRIVACY_VERSION,
        source: 'reconsent_modal',
      });

      setUser({ has_current_consent: true });
      setIsOpen(false);
      toast.success('Thank you for accepting the updated policies!');
    } catch (err) {
      toast.error('Failed to record agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-consent-title"
        >
          {/* Header banner */}
          <div
            className="p-6 border-b flex items-start gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(91,110,245,0.08), rgba(139,92,246,0.05))',
              borderColor: 'var(--color-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'rgba(91,110,245,0.15)',
                color: 'var(--color-brand)',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="badge badge-brand text-[10px] uppercase font-bold py-0.5 px-2 tracking-wider">
                Policy Update
              </span>
              <h2
                id="legal-consent-title"
                className="text-lg sm:text-xl font-bold mt-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Updated Terms & Privacy Policy
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Effective Date: {POLICY_EFFECTIVE_DATE}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              We have updated the Aliwayz marketplace policies to reflect our current local meetup platform operations, QR meetup verification mechanics, and enhanced privacy standards.
            </p>

            <div
              className="p-4 rounded-xl border space-y-2.5 text-xs"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Terms of Use
                </span>
                <Link
                  to="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand)] font-bold hover:underline inline-flex items-center gap-1"
                >
                  Review Terms <ExternalLink size={12} />
                </Link>
              </div>
              <div className="flex items-center justify-between border-t pt-2.5" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Privacy Policy
                </span>
                <Link
                  to="/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand)] font-bold hover:underline inline-flex items-center gap-1"
                >
                  Review Privacy <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* Checkbox agreement */}
            <label
              className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-colors"
              style={{
                backgroundColor: agreed ? 'rgba(91,110,245,0.06)' : 'var(--color-surface)',
                borderColor: agreed ? 'var(--color-brand)' : 'var(--color-border)',
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)] cursor-pointer"
              />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                I confirm that I am at least 18 years of age and agree to the updated <strong>Aliwayz Terms of Use</strong> and acknowledge the <strong>Privacy Policy</strong>.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-end gap-3"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Button
              fullWidth
              disabled={!agreed}
              isLoading={isSubmitting}
              loadingText="Recording agreement..."
              onClick={handleAccept}
              rightIcon={<Check size={16} />}
            >
              I Agree & Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
