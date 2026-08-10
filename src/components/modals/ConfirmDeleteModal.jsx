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
  countdownSeconds = 10,
}) {
  const [countdown, setCountdown]       = useState(countdownSeconds);
  const [canDelete, setCanDelete]       = useState(false);
  const [confirmText, setConfirmText]   = useState('');
  const intervalRef = useRef(null);
  const inputRef    = useRef(null);

  const requiredText = 'DELETE';

  // ── Reset countdown when modal opens/closes ────────────
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      setCanDelete(false);
      setConfirmText('');

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCanDelete(true);
            // Focus the input when countdown finishes
            setTimeout(() => inputRef.current?.focus(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, countdownSeconds]);

  // ── Check if DELETE typed correctly ────────────────────
  const isConfirmValid = confirmText.toUpperCase() === requiredText;
  const canProceed     = canDelete && isConfirmValid;

  // ── Handle confirm ─────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!canProceed || isLoading) return;
    onConfirm();
  }, [canProceed, isLoading, onConfirm]);

  // ── Handle close — cleanup ─────────────────────────────
  const handleClose = useCallback(() => {
    if (isLoading) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(countdownSeconds);
    setCanDelete(false);
    setConfirmText('');
    onClose();
  }, [isLoading, onClose, countdownSeconds]);

  // ── Progress percentage ────────────────────────────────
  const progressPct = ((countdownSeconds - countdown) / countdownSeconds) * 100;

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
            {/* ── Progress Bar ────────────────────────────── */}
            <div
              className="h-1 w-full"
              style={{ backgroundColor: 'var(--color-surface-elevated)' }}
            >
              <motion.div
                className="h-full"
                style={{
                  backgroundColor: canDelete
                    ? 'var(--color-error)'
                    : 'var(--color-warning)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

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
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: canDelete
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                  }}
                  animate={{
                    scale: canDelete ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: canDelete ? 2 : 0,
                  }}
                >
                  {canDelete ? (
                    <Trash2
                      size={28}
                      style={{ color: 'var(--color-error)' }}
                    />
                  ) : (
                    <AlertTriangle
                      size={28}
                      style={{ color: 'var(--color-warning)' }}
                    />
                  )}
                </motion.div>
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

              {/* ── Countdown ─────────────────────────────── */}
              {!canDelete && (
                <motion.div
                  className="text-center space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Countdown circle */}
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20">
                      {/* Background circle */}
                      <svg
                        className="w-20 h-20 -rotate-90"
                        viewBox="0 0 80 80"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="var(--color-surface-elevated)"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="var(--color-warning)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 36}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 36 * (1 - progressPct / 100),
                          }}
                          transition={{ duration: 0.3, ease: 'linear' }}
                        />
                      </svg>

                      {/* Countdown number */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                          key={countdown}
                          className="text-2xl font-bold font-mono"
                          style={{ color: 'var(--color-warning)' }}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {countdown}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Shield
                      size={14}
                      style={{ color: 'var(--color-warning)' }}
                    />
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-warning)' }}
                    >
                      Safety countdown — please wait
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Type DELETE confirmation ──────────────── */}
              {canDelete && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                        if (e.key === 'Enter' && canProceed) {
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
                </motion.div>
              )}

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
                  disabled={!canProceed || isLoading}
                  isLoading={isLoading}
                  loadingText="Deleting..."
                  onClick={handleConfirm}
                  className={cn(
                    'transition-all duration-300',
                    canProceed
                      ? '!bg-red-500 hover:!bg-red-600 !text-white !border-red-500'
                      : '!bg-[var(--color-surface-elevated)] !text-[var(--color-text-disabled)] !border-[var(--color-border)] cursor-not-allowed'
                  )}
                >
                  {canProceed ? (
                    <>
                      <Trash2 size={16} />
                      Delete {itemType}
                    </>
                  ) : canDelete ? (
                    'Type DELETE above'
                  ) : (
                    `Wait ${countdown}s...`
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