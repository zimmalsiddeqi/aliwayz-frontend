import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import Button from '@components/ui/Button';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete this item?',
  description,
  itemName,
  itemType,
  isLoading = false,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
}) {
  // ── Handle ESC key to dismiss ─────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    },
    [isOpen, isLoading, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay / Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onClose()}
          />

          {/* Centered Popup Box */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden p-6 text-center"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Trash icon at center */}
            <div className="flex justify-center mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--color-error)',
                }}
              >
                <Trash2 size={24} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-base sm:text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h3>

            {/* Optional Item Name */}
            {itemName && (
              <div className="mt-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg inline-block max-w-full truncate"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--color-error)',
                  }}
                >
                  {itemType ? `${itemType}: ` : ''}{itemName}
                </span>
              </div>
            )}

            {/* Optional Description */}
            {description && (
              <p
                className="text-xs sm:text-sm mt-2 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {description}
              </p>
            )}

            {/* Yes / No Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onClose}
                disabled={isLoading}
                className="font-medium text-sm py-2.5"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                isLoading={isLoading}
                loadingText="Deleting..."
                onClick={onConfirm}
                className="font-medium text-sm py-2.5 !bg-red-500 hover:!bg-red-600 !text-white !border-red-500"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
