import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Move, 
  Check, 
  X, 
  Crop,
  Sparkles,
  Maximize2
} from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

/**
 * Interactive Image Cropper & Repositioning Modal
 *
 * Allows users to move/pan, zoom, and rotate any image before saving/uploading.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {File|null} props.file - Selected image file to adjust
 * @param {string} [props.title='Adjust Image'] - Modal title
 * @param {string} [props.subtitle='Drag to position and frame your image'] - Modal subtitle
 * @param {number} [props.aspectRatio=1] - Width to Height ratio (1 for 1:1 square/round, 3 for banner)
 * @param {'round'|'rect'} [props.shape='round'] - Visual cutout shape ('round' for avatar/logo, 'rect' for banner)
 * @param {Function} props.onCropComplete - Callback (croppedFile: File, previewUrl: string) => void
 * @param {Function} props.onClose - Callback () => void
 */
export default function ImageCropperModal({
  isOpen,
  file,
  title = 'Adjust Image',
  subtitle = 'Drag to position and use slider to zoom',
  aspectRatio = 1,
  shape = 'round',
  onCropComplete,
  onClose,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });
  const pinchDistRef = useRef(null);

  // Compute responsive viewport dimensions
  const { viewportWidth, viewportHeight } = useMemo(() => {
    // Target base container width
    const maxWidth = 320;
    if (aspectRatio >= 2.5) {
      // Wide banner (e.g. 3:1)
      const w = maxWidth;
      const h = Math.round(w / aspectRatio);
      return { viewportWidth: w, viewportHeight: Math.max(90, h) };
    }
    if (aspectRatio > 1.3) {
      // Landscape (e.g. 16:9)
      const w = maxWidth;
      const h = Math.round(w / aspectRatio);
      return { viewportWidth: w, viewportHeight: h };
    }
    // Square / Avatar / Logo (1:1)
    const size = Math.min(270, maxWidth);
    return { viewportWidth: size, viewportHeight: size };
  }, [aspectRatio]);

  // Load image object whenever file changes
  useEffect(() => {
    if (!isOpen || !file) {
      setImageSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1.0);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, file]);

  // Determine effective dimensions based on 90/270 deg rotation
  const isRotated90or270 = rotation === 90 || rotation === 270;
  const effectiveNatW = isRotated90or270 ? naturalSize.height : naturalSize.width;
  const effectiveNatH = isRotated90or270 ? naturalSize.width : naturalSize.height;

  // Compute base cover scale
  const baseScale = useMemo(() => {
    if (!effectiveNatW || !effectiveNatH) return 1;
    return Math.max(viewportWidth / effectiveNatW, viewportHeight / effectiveNatH);
  }, [effectiveNatW, effectiveNatH, viewportWidth, viewportHeight]);

  const currentScale = baseScale * zoom;

  // Compute pan limits
  const renderedWidth = effectiveNatW * currentScale;
  const renderedHeight = effectiveNatH * currentScale;
  const maxOffsetX = Math.max(0, (renderedWidth - viewportWidth) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - viewportHeight) / 2);

  // Clamp offset to keep crop viewport filled
  const clampedX = Math.min(Math.max(offset.x, -maxOffsetX), maxOffsetX);
  const clampedY = Math.min(Math.max(offset.y, -maxOffsetY), maxOffsetY);

  // ── Drag / Touch Handlers ─────────────────────────────────────
  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      initialOffsetX: clampedX,
      initialOffsetY: clampedY,
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    setOffset({
      x: dragStartRef.current.initialOffsetX + dx,
      y: dragStartRef.current.initialOffsetY + dy,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    pinchDistRef.current = null;
  }, []);

  // Window listeners for smooth dragging outside element bounds
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Touch pinch to zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDistRef.current = dist;
    } else if (e.touches.length === 1) {
      handlePointerDown(e);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchDistRef.current) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - pinchDistRef.current) / 150;
      setZoom((prev) => Math.min(3.0, Math.max(1.0, prev + delta)));
      pinchDistRef.current = dist;
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(3.0, Math.max(1.0, prev + delta)));
  };

  // ── Actions ───────────────────────────────────────────────────
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  // ── Crop & Apply via Offscreen Canvas ─────────────────────────
  const handleApply = async () => {
    if (!imageSrc || !imgRef.current) return;
    setIsProcessing(true);

    try {
      // Output high resolution canvas
      const targetWidth = aspectRatio === 1 ? 600 : 1200;
      const targetHeight = Math.round(targetWidth / aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Solid background fallback
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Scale factor mapping viewport pixels to high-res canvas pixels
      const scaleToCanvas = targetWidth / viewportWidth;

      ctx.save();
      // 1. Move to canvas center
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // 2. Pan offset scaled to canvas
      ctx.translate(clampedX * scaleToCanvas, clampedY * scaleToCanvas);

      // 3. Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 4. Draw image
      const drawW = naturalSize.width * currentScale * scaleToCanvas;
      const drawH = naturalSize.height * currentScale * scaleToCanvas;
      ctx.drawImage(imgRef.current, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const outName = file?.name
            ? file.name.replace(/\.[^/.]+$/, '') + '-cropped.jpg'
            : 'image-cropped.jpg';

          const croppedFile = new File([blob], outName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          const previewUrl = URL.createObjectURL(blob);
          onCropComplete(croppedFile, previewUrl);
          setIsProcessing(false);
          onClose();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Error generating crop:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4 pt-1">
        <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {subtitle}
        </p>

        {/* ── Interactive Crop Canvas Area ────────────────────── */}
        <div 
          className="relative w-full h-[300px] flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-950/95 border border-white/10 shadow-inner select-none touch-none"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Viewport Cutout Frame */}
          <div
            className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{
              width: viewportWidth,
              height: viewportHeight,
              borderRadius: shape === 'round' ? '9999px' : '14px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.78), 0 0 0 2px var(--color-brand)',
            }}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${naturalSize.width * currentScale}px`,
                  height: `${naturalSize.height * currentScale}px`,
                  maxWidth: 'none',
                  transform: `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  willChange: 'transform',
                }}
              />
            )}

            {/* Rule of thirds grid overlay */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-white/60" />
              <div className="border-r border-white/60" />
              <div />
            </div>
          </div>

          {/* Quick instructions floating badge */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-white/80 flex items-center gap-1">
            <Move size={10} />
            <span>Drag image to position</span>
          </div>
        </div>

        {/* ── Controls (Zoom & Rotate) ────────────────────────── */}
        <div className="space-y-3 px-1">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1.0, z - 0.2))}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-brand-500 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono min-w-[32px] text-right font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, z + 0.2))}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Secondary tool buttons (Rotate, Reset) */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:bg-white/5"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <RotateCw size={14} />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:bg-white/5"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Maximize2 size={14} />
              <span>Recenter</span>
            </button>
          </div>
        </div>

        {/* ── Modal Footer Buttons ────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            fullWidth
            onClick={handleApply}
            isLoading={isProcessing}
            loadingText="Setting..."
            leftIcon={<Check size={16} />}
          >
            Set Image
          </Button>
        </div>
      </div>
    </Modal>
  );
}
