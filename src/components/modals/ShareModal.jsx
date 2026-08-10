import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import toast from '@lib/toast';

export default function ShareModal({ isOpen, onClose, url, title }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      handleCopy();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share" size="sm">
      <div className="mt-4 space-y-3">
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {shareUrl}
          </p>
          <Button size="icon-sm" variant="ghost" onClick={handleCopy}>
            {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
          </Button>
        </div>
        <Button fullWidth onClick={handleShare} leftIcon={<Copy size={14} />}>
          Copy Link
        </Button>
      </div>
    </Modal>
  );
}