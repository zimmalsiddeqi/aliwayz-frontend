import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertTriangle,
  Info, X, Loader2,
} from 'lucide-react';
import { cn } from '@lib/utils';

// ── Toast Store ────────────────────────────────────────
let toastId = 0;
let listeners = [];
let toasts = [];

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

function addToast(toast) {
  const id = ++toastId;
  const newToast = {
    id,
    duration:  3000,
    centered:  false,
    ...toast,
    createdAt: Date.now(),
  };
  toasts = [newToast, ...toasts].slice(0, 5);
  notify();

  if (newToast.duration > 0) {
    setTimeout(() => removeToast(id), newToast.duration);
  }

  return id;
}

function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function updateToast(id, updates) {
  toasts = toasts.map((t) =>
    t.id === id ? { ...t, ...updates } : t
  );
  notify();
}

// ── Public API ─────────────────────────────────────────
export const showToast = {
  success: (message, options = {}) =>
    addToast({ type: 'success', message, centered: false, duration: 3000, ...options }),

  error: (message, options = {}) =>
    addToast({ type: 'error', message, centered: false, duration: 3000, ...options }),

  warning: (message, options = {}) =>
    addToast({ type: 'warning', message, centered: false, duration: 3000, ...options }),

  info: (message, options = {}) =>
    addToast({ type: 'info', message, centered: false, duration: 3000, ...options }),

  loading: (message, options = {}) =>
    addToast({ type: 'loading', message, duration: 0, centered: false, ...options }),

  // Mini toast — top-right corner (non-blocking)
  mini: (message, options = {}) =>
    addToast({ type: 'info', message, centered: false, duration: 3000, ...options }),

  promise: async (promise, msgs = {}) => {
    const id = addToast({
      type:     'loading',
      message:  msgs.loading || 'Loading...',
      duration: 0,
      centered: false,
    });

    try {
      const result = await promise;
      updateToast(id, {
        type:     'success',
        message:  msgs.success || 'Done!',
        duration: 3000,
        centered: false,
      });
      return result;
    } catch (err) {
      updateToast(id, {
        type:     'error',
        message:  msgs.error || 'Something went wrong',
        duration: 3000,
        centered: false,
      });
      throw err;
    }
  },

  dismiss: (id) => {
    if (id) {
      removeToast(id);
    } else {
      toasts = [];
      notify();
    }
  },
};

// ── Toast Config ───────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    icon:      CheckCircle,
    gradient:  'linear-gradient(135deg, #059669, #10B981)',
    bg:        'rgba(16, 185, 129, 0.12)',
    bgStrong:  'rgba(16, 185, 129, 0.08)',
    border:    'rgba(16, 185, 129, 0.25)',
    iconColor: '#10B981',
    progress:  '#10B981',
    title:     'Success',
    emoji:     '✓',
  },
  error: {
    icon:      XCircle,
    gradient:  'linear-gradient(135deg, #DC2626, #EF4444)',
    bg:        'rgba(239, 68, 68, 0.12)',
    bgStrong:  'rgba(239, 68, 68, 0.08)',
    border:    'rgba(239, 68, 68, 0.25)',
    iconColor: '#EF4444',
    progress:  '#EF4444',
    title:     'Error',
    emoji:     '✕',
  },
  warning: {
    icon:      AlertTriangle,
    gradient:  'linear-gradient(135deg, #D97706, #F59E0B)',
    bg:        'rgba(245, 158, 11, 0.12)',
    bgStrong:  'rgba(245, 158, 11, 0.08)',
    border:    'rgba(245, 158, 11, 0.25)',
    iconColor: '#F59E0B',
    progress:  '#F59E0B',
    title:     'Warning',
    emoji:     '!',
  },
  info: {
    icon:      Info,
    gradient:  'linear-gradient(135deg, #0891B2, #06B6D4)',
    bg:        'rgba(6, 182, 212, 0.12)',
    bgStrong:  'rgba(6, 182, 212, 0.08)',
    border:    'rgba(6, 182, 212, 0.25)',
    iconColor: '#06B6D4',
    progress:  '#06B6D4',
    title:     'Info',
    emoji:     'i',
  },
  loading: {
    icon:      Loader2,
    gradient:  'linear-gradient(135deg, #4F46E5, #7C3AED)',
    bg:        'rgba(91, 110, 245, 0.12)',
    bgStrong:  'rgba(91, 110, 245, 0.08)',
    border:    'rgba(91, 110, 245, 0.25)',
    iconColor: '#5B6EF5',
    progress:  '#5B6EF5',
    title:     'Loading',
    emoji:     '⟳',
  },
};

// ── CENTER POPUP (Success / Error / Warning) ───────────
function CenterPopup({ toast, onDismiss }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon   = config.icon;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      />

      {/* Popup */}
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border:          `1px solid ${config.border}`,
          boxShadow:       `0 24px 80px rgba(0,0,0,0.3), 0 0 40px ${config.border}`,
        }}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        {/* Top glow bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: config.gradient }}
        />

        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-20 blur-[60px] pointer-events-none"
          style={{ background: config.gradient }}
        />

        <div className="relative px-6 pt-8 pb-6 text-center space-y-5">
          {/* Animated icon */}
          <div className="flex justify-center">
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                damping: 12,
                stiffness: 200,
                delay: 0.15,
              }}
            >
              {/* Ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `3px solid ${config.iconColor}` }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: 'easeOut',
                }}
              />

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: config.bg }}
              >
                {toast.type === 'loading' ? (
                  <Loader2
                    size={36}
                    className="animate-spin"
                    style={{ color: config.iconColor }}
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 10,
                      stiffness: 200,
                      delay: 0.25,
                    }}
                  >
                    <Icon
                      size={36}
                      style={{ color: config.iconColor }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {toast.title || config.title}
          </motion.h3>

          {/* Message */}
          <motion.p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {toast.message}
          </motion.p>

          {/* OK Button */}
          <motion.button
            onClick={onDismiss}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              background: config.gradient,
              boxShadow:  `0 4px 20px ${config.border}`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
          >
            {toast.type === 'error'
              ? 'Got It'
              : toast.type === 'warning'
                ? 'Understood'
                : 'OK'}
          </motion.button>

          {/* Action button (optional) */}
          {toast.action && (
            <motion.button
              onClick={() => {
                toast.action.onClick?.();
                onDismiss();
              }}
              className="text-xs font-semibold hover:underline"
              style={{ color: config.iconColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {toast.action.label}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── MINI TOAST (top-right corner) ──────────────────────
function MiniToast({ toast, onDismiss }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon   = config.icon;

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const start    = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(
        0,
        100 - (elapsed / toast.duration) * 100
      );
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="relative w-full max-w-[360px] overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          `1px solid ${config.border}`,
        boxShadow:       `0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px ${config.border}`,
      }}
    >
      <div className="relative flex items-center gap-3 p-3.5">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: config.bg }}
        >
          {toast.type === 'loading' ? (
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: config.iconColor }}
            />
          ) : (
            <Icon
              size={16}
              style={{ color: config.iconColor }}
            />
          )}
        </div>

        <p
          className="flex-1 text-[13px] font-medium leading-snug"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {toast.message}
        </p>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[var(--glass-bg-strong)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={13} />
        </button>
      </div>

      {toast.duration > 0 && !toast.hideProgress && (
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: config.bg }}
        >
          <motion.div
            className="h-full"
            style={{ backgroundColor: config.progress }}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ── Toast Container ────────────────────────────────────
export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState([]);

  useEffect(() => {
    return subscribe(setCurrentToasts);
  }, []);

  const centerToast = currentToasts.find((t) => t.centered);
  const miniToasts  = currentToasts.filter((t) => !t.centered);

  return (
    <>
      {/* Center popup */}
      <AnimatePresence>
        {centerToast && (
          <CenterPopup
            key={centerToast.id}
            toast={centerToast}
            onDismiss={() => removeToast(centerToast.id)}
          />
        )}
      </AnimatePresence>

      {/* Mini toasts — top right */}
      <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 items-end pointer-events-none sm:top-6 sm:right-6">
        <AnimatePresence mode="popLayout">
          {miniToasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto w-full"
            >
              <MiniToast
                toast={toast}
                onDismiss={() =>
                  removeToast(toast.id)
                }
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default showToast;