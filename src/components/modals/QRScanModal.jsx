import { useState } from 'react';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { ScanLine } from 'lucide-react';

export default function QRScanModal({ isOpen, onClose, onScan, isLoading }) {
  const [token, setToken] = useState('');

  const handleScan = () => {
    if (!token.trim()) return;
    onScan(token.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code" description="Paste the QR token from the seller" size="sm">
      <div className="mt-4 space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste QR token..."
          className="font-mono text-xs"
          autoFocus
        />
        <Button
          fullWidth
          disabled={!token.trim()}
          isLoading={isLoading}
          loadingText="Verifying..."
          leftIcon={<ScanLine size={16} />}
          onClick={handleScan}
        >
          Verify & Complete Purchase
        </Button>
      </div>
    </Modal>
  );
}