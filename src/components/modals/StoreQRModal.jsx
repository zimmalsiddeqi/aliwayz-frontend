import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Copy, Check, Store as StoreIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import toast from '@lib/toast';

const StoreQRModal = ({ isOpen, onClose, store }) => {
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !store) return null;

  const storeUrl = `${window.location.origin}/store/${store.slug}`;
  const displayUrl = `${window.location.host}/store/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success('Store link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // High-resolution canvas for print/flyer quality
      const width = 1200;
      const height = 1500;
      canvas.width = width;
      canvas.height = height;

      img.onload = () => {
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Header decorative top bar (Brand gradient)
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#5B6EF5');
        gradient.addColorStop(0.5, '#7C3AED');
        gradient.addColorStop(1, '#EC4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 24);

        // Outer border
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 50, width - 60, height - 80);

        ctx.textAlign = 'center';

        // Tagline
        ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#5B6EF5';
        ctx.fillText('OFFICIAL STORE QR CODE', width / 2, 135);

        // Store Name
        ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0F172A';
        const storeName = store.store_name || 'My Store';
        ctx.fillText(storeName, width / 2, 210);

        // Location / Subtitle
        if (store.location_city) {
          ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText(`📍 ${store.location_city}`, width / 2, 265);
        }

        // Draw QR Code centered
        const qrSize = 650;
        const qrX = (width - qrSize) / 2;
        const qrY = 320;

        // Subtle box behind QR
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 24);
        } else {
          ctx.rect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);
        }
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Bottom Call to action
        ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText('SCAN TO VIEW ALL STORE LISTINGS', width / 2, 1080);

        ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('Browse full inventory, photos, pricing & contact seller on Aliwayz', width / 2, 1135);

        // Store URL Pill
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText(displayUrl, width / 2, 1220);

        // Footer brand
        ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Powered by Aliwayz — The Local Marketplace', width / 2, 1420);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Store_QR_${store.store_name.replace(/\s+/g, '_')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('Store QR Code downloaded!');
      };

      const base64Data = btoa(unescape(encodeURIComponent(svgData)));
      img.src = `data:image/svg+xml;base64,${base64Data}`;
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  const printQR = () => {
    const printContent = qrRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Store QR Sign — ${store.store_name}</title>
          <style>
            @page {
              size: letter portrait;
              margin: 0.5in;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 95vh;
              margin: 0;
              background-color: #fff;
              color: #0f172a;
            }
            .print-container {
              border: 8px solid #0f172a;
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              width: 100%;
              max-width: 580px;
              box-sizing: border-box;
            }
            .header-tag {
              font-size: 16px;
              font-weight: 800;
              color: #4338ca;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin: 0 0 10px 0;
            }
            h1 {
              font-size: 38px;
              line-height: 1.2;
              margin: 0 0 8px 0;
              color: #0f172a;
            }
            .location {
              font-size: 18px;
              color: #64748b;
              margin: 0 0 25px 0;
            }
            .qr-card {
              display: inline-block;
              padding: 20px;
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 16px;
              margin-bottom: 25px;
            }
            .qr-card svg {
              width: 280px;
              height: 280px;
              display: block;
            }
            .heading {
              font-size: 24px;
              font-weight: 900;
              margin: 0 0 8px 0;
              text-transform: uppercase;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .subheading {
              font-size: 15px;
              color: #475569;
              font-weight: 500;
              margin: 0 0 15px 0;
            }
            .url-box {
              display: inline-block;
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              background: #f1f5f9;
              padding: 8px 18px;
              border-radius: 8px;
              color: #334155;
            }
            .footer-tag {
              margin-top: 30px;
              font-size: 12px;
              color: #94a3b8;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header-tag">Official Store Sign</div>
            <h1>${store.store_name}</h1>
            ${store.location_city ? `<div class="location">📍 ${store.location_city}</div>` : ''}
            
            <div class="qr-card">
              ${printContent}
            </div>

            <div class="heading">SCAN TO BROWSE ALL LISTINGS</div>
            <div class="subheading">Scan with your smartphone camera to see all available items, pricing, photos & contact info on Aliwayz</div>
            
            <div class="url-box">${displayUrl}</div>

            <div class="footer-tag">Powered by Aliwayz Marketplace</div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <StoreIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Store QR Code
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Point buyers directly to all your listings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 transition-colors rounded-full hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div
              className="flex flex-col items-center p-6 text-center border-2 border-dashed rounded-2xl"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              {/* Store Avatar & Info */}
              <div className="mb-3">
                <Avatar src={store.logo_url} name={store.store_name} size="lg" />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h2 className="text-xl font-bold truncate max-w-[280px]" style={{ color: 'var(--color-text-primary)' }}>
                  {store.store_name}
                </h2>
                {store.is_verified && <span title="Verified Seller">✅</span>}
              </div>

              {store.location_city && (
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  📍 {store.location_city}
                </p>
              )}

              {/* QR Code Canvas */}
              <div
                ref={qrRef}
                className="p-4 bg-white rounded-2xl shadow-md mb-4 flex justify-center items-center border border-slate-200"
              >
                <QRCodeSVG
                  value={storeUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Scan description */}
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-[var(--color-brand)]">
                  SCAN TO BROWSE ALL STORE LISTINGS
                </p>
                <p className="text-[11px] max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Buyers scan this code with their phone camera to instantly view your full inventory and contact you directly.
                </p>
              </div>

              {/* URL Pill with Copy */}
              <div
                className="mt-4 flex items-center justify-between gap-2 w-full max-w-xs px-3 py-1.5 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="truncate font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {displayUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 font-semibold text-[11px] text-[var(--color-brand)] hover:underline flex-shrink-0"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 mt-5">
              <Button fullWidth variant="outline" size="sm" onClick={downloadQR} leftIcon={<Download size={15} />}>
                Download PNG
              </Button>
              <Button fullWidth variant="brand" size="sm" onClick={printQR} leftIcon={<Printer size={15} />}>
                Print Sign
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoreQRModal;
