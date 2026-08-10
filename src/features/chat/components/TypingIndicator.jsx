import { motion } from 'framer-motion';

export default function TypingIndicator({ username }) {
  return (
    <div className="flex items-center gap-2 pl-8">
      <div className="flex gap-1 px-3 py-2 rounded-2xl"
           style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-text-muted)' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      {username && (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {username} is typing...
        </span>
      )}
    </div>
  );
}