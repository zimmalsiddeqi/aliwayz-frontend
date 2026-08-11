import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Input from '@components/ui/Input';
import { cn } from '@lib/utils';

export const CATEGORY_ICONS = {
  Electronics: '📱',
  Phones: '📱',
  Fashion: '👗',
  Shoes: '👟',
  Bags: '👜',
  Home: '🏠',
  House: '🏠',
  Apartment: '🏢',
  Property: '🏡',
  Kitchen: '🍳',
  Sports: '⚽',
  Fitness: '🏋️',
  Books: '📚',
  Toys: '🧸',
  Baby: '👶',
  Pets: '🐾',
  Garden: '🌱',
  Tools: '🔧',
  Office: '💼',
  Music: '🎵',
  Collectibles: '🏆',
  Photography: '📷',
  Drones: '🚁',
  Art: '🎨',
  Handmade: '🤝',
  'Automotive Parts': '⚙️',
  'Digital Products': '💻',
  Other: '📦',
};

export default function SearchCategoriesModal({ isOpen, onClose, categories, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQuery = searchQuery.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(lowerQuery));
  }, [categories, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-[var(--color-surface)] sm:rounded-2xl shadow-xl sm:border border-[var(--color-border)] flex flex-col pointer-events-auto overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-surface)] z-10">
                <h2 className="text-lg font-bold">All Categories</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[var(--glass-bg-strong)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 border-b border-[var(--color-border)] sticky top-[69px] bg-[var(--color-surface)] z-10">
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={18} className="text-[var(--color-text-muted)]" />}
                  autoFocus
                />
              </div>

              <div className="p-2 overflow-y-auto flex-1 hide-scrollbar">
                {filteredCategories.length === 0 ? (
                  <div className="py-8 text-center text-[var(--color-text-muted)]">
                    No categories found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => onSelect(cat)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg-strong)] transition-colors text-left"
                        style={{ border: '1px solid transparent' }}
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--glass-bg-strong)] flex items-center justify-center text-lg">
                          {CATEGORY_ICONS[cat.name] || cat.icon || '📦'}
                        </div>
                        <span className="font-medium text-sm flex-1 truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
