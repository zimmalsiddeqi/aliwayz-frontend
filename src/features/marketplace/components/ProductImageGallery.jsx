import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import ImagePreviewModal from '@components/modals/ImagePreviewModal';
import { cn } from '@lib/utils';

export default function ProductImageGallery({ images = [] }) {
  const [active, setActive]     = useState(0);
  const [preview, setPreview]   = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
        <span className="text-6xl opacity-20">📦</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
        <img src={images[active]} alt="" className="w-full h-full object-contain" />

        <button onClick={() => setPreview(true)} className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md" style={{ backgroundColor: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)' }}>
          <ZoomIn size={16} />
        </button>

        {images.length > 1 && (
          <>
            <button onClick={() => setActive((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl backdrop-blur-md"
              style={{ backgroundColor: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setActive((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl backdrop-blur-md"
              style={{ backgroundColor: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)' }}>
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md"
                 style={{ backgroundColor: 'var(--glass-bg-strong)', color: 'var(--color-text-primary)', border: '1px solid var(--glass-border)' }}>
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={cn('w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all')}
              style={{ borderColor: active === i ? 'var(--color-brand)' : 'var(--color-border)', opacity: active === i ? 1 : 0.6 }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <ImagePreviewModal isOpen={preview} onClose={() => setPreview(false)} images={images} initialIndex={active} />
    </div>
  );
}