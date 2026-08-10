import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useOnClickOutside from '@hooks/useOnClickOutside';
import { cn } from '@lib/utils';

export default function Dropdown({ trigger, items = [], className, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1">
        {trigger}
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--color-text-muted)',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              'absolute top-full mt-2 min-w-[160px] rounded-xl p-1.5 z-50',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="divider my-1" />
              ) : (
                <button
                  key={i}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[var(--glass-bg-strong)]',
                    item.danger && 'hover:bg-red-500/10',
                    item.disabled && 'opacity-40 cursor-not-allowed'
                  )}
                  style={{
                    color: item.danger ? 'var(--color-error)' : 'var(--color-text-secondary)',
                  }}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}