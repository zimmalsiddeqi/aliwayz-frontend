import Modal from '@components/ui/Modal';
import { Clock, RefreshCw } from 'lucide-react';
import Button from '@components/ui/Button';

export default function QRModal({ isOpen, onClose, qrData, countdown, onCancel, onRegenerate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" description="Show this to the buyer to complete the sale" size="sm">
      <div className="mt-4 text-center space-y-4">
        {qrData?.qr_code && (
          <img src={qrData.qr_code} alt="QR Code" className="w-56 h-56 mx-auto rounded-2xl" />
        )}

        <div className="flex items-center justify-center gap-2">
          <Clock size={16} style={{ color: countdown === 'Expired' ? 'var(--color-error)' : 'var(--color-warning)' }} />
          <span className="font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {countdown}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="danger" fullWidth size="sm" onClick={onCancel}>Cancel QR</Button>
          <Button variant="outline" fullWidth size="sm" leftIcon={<RefreshCw size={12} />} onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      </div>
    </Modal>
  );
}