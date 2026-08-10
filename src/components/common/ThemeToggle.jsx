import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useUIStore from '@store/ui.store';
import { cn } from '@lib/utils';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
        isDark
          ? 'hover:bg-white/5 text-slate-400 hover:text-yellow-400'
          : 'hover:bg-black/5 text-slate-500 hover:text-indigo-600',
        className
      )}
      style={{ border: '1px solid var(--color-border)' }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.div>
    </button>
  );
}