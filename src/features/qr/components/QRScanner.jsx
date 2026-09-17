import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import toast from '@lib/toast';
import Spinner from '@components/ui/Spinner';
import { extractQRToken } from '@utils/helpers';

export default function QRScanner({ onScan, isLoading }) {
  const scannedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    scannedRef.current = false;
    let isMounted = true;

    // Initialize with hardware-accelerated BarcodeDetector and QR_CODE format filter
    const html5QrCode = new Html5Qrcode('qr-reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      verbose: false,
    });

    const cameraConfig = {
      facingMode: 'environment',
    };

    const scanConfig = {
      fps: 25, // High frame rate for instant detection
      aspectRatio: undefined, // Native camera aspect ratio to avoid distortion
      videoConstraints: {
        facingMode: 'environment',
        focusMode: 'continuous',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    html5QrCode
      .start(
        cameraConfig,
        scanConfig,
        (decodedText) => {
          if (!isMounted || scannedRef.current) return;
          scannedRef.current = true;

          html5QrCode
            .stop()
            .catch(() => {})
            .finally(() => {
              if (isMounted) {
                const cleanedToken = extractQRToken(decodedText);
                onScan(cleanedToken);
              }
            });
        },
        () => {} // ignore frame parse failures
      )
      .catch((err) => {
        if (!isMounted) return;
        console.error('Camera start error:', err);
        toast.error('Failed to start camera. Please ensure camera permissions are granted.');
      });

    return () => {
      isMounted = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onScan, isLoading]);

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Scan QR Code</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Point camera at the QR code — any angle, distance, or lighting
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-black/90 relative min-h-[300px] flex items-center justify-center border border-white/10 shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Spinner size="lg" className="text-white mb-2" />
            <p className="text-white font-medium">Verifying Purchase...</p>
          </div>
        )}
        
        {/* Full-viewfinder video container */}
        <div id="qr-reader" className="w-full h-full min-h-[300px] [&>div]:border-none [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

        {/* Viewfinder Target Reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-56 h-56 border-2 border-brand-500/40 rounded-2xl">
            {/* Corner brackets */}
            <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
            <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
            {/* Horizontal scan line indicator */}
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-pulse" style={{ top: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}