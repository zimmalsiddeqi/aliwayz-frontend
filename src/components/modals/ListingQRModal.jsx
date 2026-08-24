import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@components/ui/Button';
import { CATEGORY_IDS } from '@utils/constants';

const ListingQRModal = ({ isOpen, onClose, product }) => {
  const qrRef = useRef(null);

  if (!isOpen || !product) return null;

  const isAutomotive = product.category_id === CATEGORY_IDS.VEHICLES || product.category_id === CATEGORY_IDS.AUTOMOTIVE;
  const isRealEstate = product.category_id === CATEGORY_IDS.REAL_ESTATE || product.category_id === CATEGORY_IDS.PROPERTY;

  // For vehicles it might be better to say "FOR SALE", for real estate "FOR SALE / RENT"
  const headerText = isRealEstate ? "FOR SALE / RENT" : "FOR SALE";
  const itemType = isAutomotive ? "VEHICLE" : isRealEstate ? "PROPERTY" : "ITEM";

  // URL pointing to the product
  const listingUrl = `${window.location.origin}/product/${product.id}`;

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Set explicit size for high-res download
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      // Draw background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw QR Code
      ctx.drawImage(img, 0, 0, size, size);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${product.title.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printQR = () => {
    const printContent = qrRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { 
              font-family: sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
            }
            .print-container { 
              border: 8px solid black; 
              padding: 40px; 
              text-align: center; 
              width: 80%; 
              max-width: 600px;
            }
            h1 { font-size: 48px; margin: 0 0 20px 0; text-transform: uppercase; }
            h2 { font-size: 32px; margin: 0 0 10px 0; font-weight: normal; }
            h3 { font-size: 36px; margin: 0 0 40px 0; color: #444; }
            .qr-wrapper { margin-bottom: 40px; }
            .qr-wrapper svg { width: 300px; height: 300px; }
            p { font-size: 24px; font-weight: bold; margin: 0; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${headerText}</h1>
            <h2>${product.title}</h2>
            <h3>${product.currency || '$'}${product.price}</h3>
            <div class="qr-wrapper">
              ${printContent}
            </div>
            <p>SCAN TO VIEW THIS ${itemType} ON ALIWAYZ</p>
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
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Listing QR Code
            </h3>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div 
              className="flex flex-col items-center p-6 text-center border-4 border-dashed rounded-xl"
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-body)' 
              }}
            >
              <h2 className="mb-2 text-2xl font-bold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                {headerText}
              </h2>
              <p className="mb-1 text-lg font-medium truncate w-full" style={{ color: 'var(--color-text-secondary)' }}>
                {product.title}
              </p>
              <p className="mb-6 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {product.currency || '$'}{product.price}
              </p>

              <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-sm mb-6 flex justify-center items-center">
                <QRCodeSVG
                  value={listingUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                Scan to view this {itemType.toLowerCase()} on Aliwayz
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button fullWidth variant="secondary" onClick={downloadQR} className="gap-2">
                <Download size={18} />
                Download PNG
              </Button>
              <Button fullWidth onClick={printQR} className="gap-2">
                <Printer size={18} />
                Print Sign
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListingQRModal;
