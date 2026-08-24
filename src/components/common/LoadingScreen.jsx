import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ backgroundColor: 'var(--color-bg)' }}>
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src="/logo.png" alt="Aliwayz Loading" className="w-16 h-16 rounded-2xl shadow-lg object-contain" />
        </motion.div>

        {/* Spinner dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-brand)' }}
              animate={{
                y:       [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat:   Infinity,
                delay:    i * 0.15,
                ease:     'easeInOut',
              }}
            />
          ))}
        </div>

        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading...
        </p>
      </motion.div>
    </div>
  );
}