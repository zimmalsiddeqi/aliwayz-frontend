import { useState } from 'react';
import { ShieldCheck, X, ShieldAlert, CheckCircle } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function SellerVerifiedBadge({ className = '' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-pointer select-none hover:bg-emerald-500/25 transition-all ${className}`}
        title="Click to view identity check details"
      >
        <ShieldCheck size={12} />
        Identity Verified
      </span>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Seller Identity Verification"
      >
        <div className="space-y-4 p-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-brand">
            <CheckCircle size={28} />
          </div>
          <div>
            <h4 className="text-base font-bold text-theme-primary">Identity Verified Seller</h4>
            <p className="text-xs text-theme-secondary mt-1.5 leading-relaxed">
              This seller has successfully completed our standard U.S. Marketplace Identity Check. 
              Their government photo identification matches their selfie submission.
            </p>
          </div>
          
          <div className="rounded-xl border border-theme-border bg-surface-900 p-3.5 text-left text-xs space-y-2">
            <h5 className="font-semibold text-theme-primary flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-500" />
              Important Information for Buyers
            </h5>
            <ul className="list-disc pl-4 text-[11px] text-theme-secondary space-y-1.5">
              <li>Verification confirms that the seller is a real person with validated government records.</li>
              <li>It protects the community against duplicate accounts and identity spoofing.</li>
              <li>Verification does **not** constitute product quality endorsement, condition guarantee, or financial underwriting by Aliwayz.</li>
            </ul>
          </div>

          <Button fullWidth onClick={() => setShowModal(false)}>
            Got it, thanks
          </Button>
        </div>
      </Modal>
    </>
  );
}
