import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatQRExpiry } from '@utils/formatters';
import { cn } from '@lib/utils';

export default function QRCountdown({ expiresAt, onExpired }) {
  const [countdown, setCountdown] = useState('');
  const expired = countdown === 'Expired';

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const val = formatQRExpiry(expiresAt);
      setCountdown(val);
      if (val === 'Expired') {
        onExpired?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={cn('flex items-center gap-2 justify-center', expired ? 'text-[var(--color-error)]' : 'text-[var(--color-warning)]')}>
      <Clock size={18} />
      <span className="font-mono text-2xl font-bold">{countdown}</span>
    </div>
  );
}