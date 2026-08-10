import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchSuggestions({ suggestions = [], onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="space-y-1">
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(s)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
          style={{ color: 'var(--color-text-primary)' }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="flex-1 truncate">{s}</span>
          <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
        </motion.button>
      ))}
    </div>
  );
}