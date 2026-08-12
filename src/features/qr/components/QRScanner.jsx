import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from '@lib/toast';
import Spinner from '@components/ui/Spinner';

export default function QRScanner({ onScan, isLoading }) {
  useEffect(() => {
    if (isLoading) return;

    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        html5QrCode.stop().then(() => {
          onScan(decodedText.trim());
        }).catch(console.error);
      },
      (error) => {} // ignore
    ).catch((err) => {
      console.error(err);
      toast.error('Failed to start camera. Please ensure permissions are granted.');
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan, isLoading]);

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Scan QR Code</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Point your camera at the seller's screen
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-black/5 relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <Spinner size="lg" className="text-white mb-2" />
            <p className="text-white font-medium">Verifying Purchase...</p>
          </div>
        )}
        <div id="qr-reader" className="w-full [&>div]:border-none [&_video]:object-cover" />
      </div>
    </div>
  );
}