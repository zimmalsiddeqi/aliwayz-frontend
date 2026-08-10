import { useState } from 'react';
import { ScanLine } from 'lucide-react';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';

export default function QRScanner({ onScan, isLoading }) {
  const [token, setToken] = useState('');

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
             style={{ background: 'rgba(91,110,245,0.1)' }}>
          <ScanLine size={32} style={{ color: 'var(--color-brand)' }} />
        </div>
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Scan QR Code</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Ask the seller for the QR code, then paste the token below
        </p>
      </div>

      <Input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste QR token..."
        className="font-mono text-xs"
        autoFocus
      />

      <Button
        fullWidth
        size="lg"
        disabled={!token.trim()}
        isLoading={isLoading}
        loadingText="Verifying..."
        leftIcon={<ScanLine size={18} />}
        onClick={() => onScan(token.trim())}
      >
        Complete Purchase
      </Button>
    </div>
  );
}