import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePreviewModal({ isOpen, onClose, images = [], initialIndex = 0 }) {
  const [current, setCurrent] = useState(initialIndex);

  if (!isOpen) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 rounded-xl text-white hover:bg-white/10" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt=""
            className="w-full max-h-[80vh] object-contain rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70">
              <ChevronLeft size={24} />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}