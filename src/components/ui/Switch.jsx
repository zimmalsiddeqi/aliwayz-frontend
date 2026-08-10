import { motion } from 'framer-motion';
import { cn } from '@lib/utils';

export default function Switch({ checked, onChange, label, disabled, className }) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]'
        )}
        style={{ backgroundColor: checked ? 'var(--color-brand)' : 'var(--color-surface-overlay)' }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </button>
      {label && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}