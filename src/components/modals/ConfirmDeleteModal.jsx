import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, Shield } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { cn } from '@lib/utils';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete permanently?',
  description,
  itemName,
  itemType = 'item',
  isLoading = false,
}) {
  const [confirmText, setConfirmText] = useState('');
  const inputRef = useRef(null);

  const requiredText = 'DELETE';

  // ── Reset confirmation text when modal opens/closes ──
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Check if DELETE typed correctly ────────────────────
  const isConfirmValid = confirmText.toUpperCase() === requiredText;

  // ── Handle confirm ─────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!isConfirmValid || isLoading) return;
    onConfirm();
  }, [isConfirmValid, isLoading, onConfirm]);

  // ── Handle close — cleanup ─────────────────────────────
  const handleClose = useCallback(() => {
    if (isLoading) return;
    setConfirmText('');
    onClose();
  }, [isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
              boxShadow:       'var(--shadow-xl)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Close Button ────────────────────────────── */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)] z-10"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>

            {/* ── Content ─────────────────────────────────── */}
            <div className="p-6 space-y-5">
              {/* Warning icon */}
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <Trash2
                    size={28}
                    style={{ color: 'var(--color-error)' }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {title}
                </h3>

                {description && (
                  <p
                    className="text-sm mt-2 max-w-sm mx-auto"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {description}
                  </p>
                )}

                {itemName && (
                  <div
                    className="mt-3 px-4 py-2.5 rounded-xl inline-block"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border:          '1px solid rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-error)' }}
                    >
                      {itemType}: {itemName}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Type DELETE confirmation ──────────────── */}
              <div className="space-y-3">
                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Type{' '}
                    <span
                      className="font-bold font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color:           'var(--color-error)',
                      }}
                    >
                      DELETE
                    </span>
                    {' '}to confirm
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isConfirmValid) {
                        handleConfirm();
                      }
                    }}
                    placeholder="Type DELETE here"
                    className="input-base font-mono text-center tracking-widest uppercase"
                    style={{
                      borderColor: isConfirmValid
                        ? 'var(--color-error)'
                        : 'var(--color-border)',
                    }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {/* Visual feedback */}
                <div className="flex justify-center gap-1.5">
                  {requiredText.split('').map((char, i) => {
                    const typed  = confirmText[i]?.toUpperCase();
                    const match  = typed === char;
                    const filled = i < confirmText.length;

                    return (
                      <motion.div
                        key={i}
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono border transition-all duration-200'
                        )}
                        style={{
                          backgroundColor: match
                            ? 'rgba(239, 68, 68, 0.15)'
                            : filled
                              ? 'rgba(239, 68, 68, 0.05)'
                              : 'var(--color-surface-elevated)',
                          borderColor: match
                            ? 'var(--color-error)'
                            : filled
                              ? 'rgba(239, 68, 68, 0.3)'
                              : 'var(--color-border)',
                          color: match
                            ? 'var(--color-error)'
                            : 'var(--color-text-muted)',
                        }}
                        animate={
                          match
                            ? { scale: [1, 1.1, 1] }
                            : {}
                        }
                        transition={{ duration: 0.15 }}
                      >
                        {filled ? typed : char}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ── Action Buttons ────────────────────────── */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  disabled={!isConfirmValid || isLoading}
                  isLoading={isLoading}
                  loadingText="Deleting..."
                  onClick={handleConfirm}
                  className={cn(
                    'transition-all duration-300',
                    isConfirmValid
                      ? '!bg-red-500 hover:!bg-red-600 !text-white !border-red-500'
                      : '!bg-[var(--color-surface-elevated)] !text-[var(--color-text-disabled)] !border-[var(--color-border)] cursor-not-allowed'
                  )}
                >
                  {isConfirmValid ? (
                    <>
                      <Trash2 size={16} />
                      Delete {itemType}
                    </>
                  ) : (
                    'Type DELETE above'
                  )}
                </Button>
              </div>

              {/* Warning text */}
              <p
                className="text-[11px] text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ⚠️ This action is permanent and cannot be undone.
                All associated data will be lost.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}