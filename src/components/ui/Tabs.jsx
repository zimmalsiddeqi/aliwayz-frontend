import { createContext, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@lib/utils';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue || '');
  const active   = value !== undefined ? value : internal;
  const setActive = onValueChange || setInternal;

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn('flex items-center gap-1 p-1 rounded-xl', className)}
      style={{ backgroundColor: 'var(--color-surface-elevated)' }}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'relative flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 outline-none',
        className
      )}
      style={{
        color: isActive ? 'white' : 'var(--color-text-secondary)',
      }}
    >
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: 'var(--color-brand)' }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <motion.div
      className={cn('mt-4', className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}