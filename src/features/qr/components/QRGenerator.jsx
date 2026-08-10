import { useState, useEffect } from 'react';
import { Clock, RefreshCw, X } from 'lucide-react';
import Button from '@components/ui/Button';
import { formatQRExpiry } from '@utils/formatters';

export default function QRGenerator({ qrData, onCancel, onRegenerate, isLoading }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!qrData?.expires_at) return;
    const interval = setInterval(() => {
      setCountdown(formatQRExpiry(qrData.expires_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData?.expires_at]);

  if (!qrData) return null;

  return (
    <div className="text-center space-y-4">
      <div className="card p-6 inline-block mx-auto">
        <img src={qrData.qr_code} alt="QR Code" className="w-64 h-64 rounded-xl" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <Clock size={16} style={{ color: countdown === 'Expired' ? 'var(--color-error)' : 'var(--color-warning)' }} />
        <span className="font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {countdown}
        </span>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Show this to the buyer to complete the sale
      </p>

      <div className="flex gap-3">
        <Button variant="danger" fullWidth size="sm" onClick={onCancel} isLoading={isLoading} leftIcon={<X size={14} />}>
          Cancel
        </Button>
        <Button variant="outline" fullWidth size="sm" onClick={onRegenerate} leftIcon={<RefreshCw size={14} />}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}