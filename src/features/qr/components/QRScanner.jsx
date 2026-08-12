import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Spinner from '@components/ui/Spinner';

export default function QRScanner({ onScan, isLoading }) {
  useEffect(() => {
    // Only initialize scanner if not loading
    if (isLoading) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    }, false);

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText.trim());
      },
      (error) => {
        // Ignore standard "no QR found" spam
      }
    );

    return () => {
      scanner.clear().catch(console.error);
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