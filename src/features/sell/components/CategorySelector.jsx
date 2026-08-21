import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft, Search, Check, AlertCircle } from 'lucide-react';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategorySelector({ value, onChange, rootCategoryId = null, excludeCategoryIds = [], error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch categories flat list & tree list
  const { data: flatData } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
  });

  const { data: treeData, isLoading } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: () => CategoryService.getTree().then((r) => r.data),
  });

  const allFlat = Array.isArray(flatData) ? flatData : (flatData?.data || []);
  const allTree = Array.isArray(treeData) ? treeData : (treeData?.data || []);

  // Reset navigation when modal opens
  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Determine root items to display
  let rootItems = [];
  if (rootCategoryId) {
    // If rootCategoryId is provided, find that category in the tree and display its children
    const findNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const rootNode = findNode(allTree, rootCategoryId);
    rootItems = rootNode ? rootNode.children || [] : [];
  } else {
    // Otherwise, display all top-level categories EXCEPT excluded ones
    rootItems = allTree.filter(
      (c) => !c.parent_id && !excludeCategoryIds.includes(c.id)
    );
  }

  const currentCategory = history[history.length - 1] || null;
  const displayItems = currentCategory
    ? currentCategory.children || []
    : rootItems;

  // Selected category information (breadcrumb path)
  const selectedCat = allFlat.find((c) => c.id === value);
  const getBreadcrumbPath = (catId) => {
    const path = [];
    let curr = allFlat.find((c) => c.id === catId);
    while (curr) {
      path.unshift(curr.name);
      curr = allFlat.find((c) => c.id === curr.parent_id);
    }
    return path.join(' › ');
  };

  const handleItemClick = (cat) => {
    if (cat.children && cat.children.length > 0) {
      setHistory([...history, cat]);
    } else {
      // Leaf category selected
      onChange(cat.id);
      setIsOpen(false);
    }
  };

  const handleBackClick = () => {
    setHistory(history.slice(0, -1));
  };

  const handleSelectParent = (cat) => {
    onChange(cat.id);
    setIsOpen(false);
  };

  // Search filter across the allowed subtree
  const isDescendant = (nodeId, ancestorId) => {
    if (!ancestorId) return true;
    let curr = allFlat.find((c) => c.id === nodeId);
    while (curr) {
      if (curr.parent_id === ancestorId) return true;
      curr = allFlat.find((c) => c.id === curr.parent_id);
    }
    return false;
  };

  const filteredFlatList = allFlat.filter((c) => {
    // Check exclusion
    if (excludeCategoryIds.includes(c.id)) return false;
    let curr = c;
    while (curr) {
      if (excludeCategoryIds.includes(curr.parent_id)) return false;
      curr = allFlat.find((x) => x.id === curr.parent_id);
    }

    // Check root parent filter
    if (rootCategoryId && !isDescendant(c.id, rootCategoryId) && c.id !== rootCategoryId) {
      return false;
    }

    return true;
  });

  const searchResults = searchQuery.trim()
    ? filteredFlatList.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-1">
      <label className="floating-label">Category *</label>
      
      {/* Selector trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] ${
          error ? 'border-red-500 bg-red-500/5' : 'hover:border-[var(--color-text-secondary)]'
        }`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: error ? 'var(--color-accent-red)' : 'var(--color-border)',
        }}
      >
        <span
          className={selectedCat ? 'font-medium' : ''}
          style={{ color: selectedCat ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
        >
          {selectedCat ? getBreadcrumbPath(value) : 'Select category...'}
        </span>
        <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
      </button>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Popup selection modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex h-full max-h-[500px] w-full max-w-lg flex-col rounded-3xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Select Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-[var(--glass-bg-strong)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Close
                </button>
              </div>

              {/* Search input */}
              <div className="border-b p-3">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-3" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Options list */}
              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Loading categories...
                    </span>
                  </div>
                ) : searchQuery.trim() ? (
                  // Search view
                  <div>
                    {searchResults.length === 0 ? (
                      <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        No categories found
                      </div>
                    ) : (
                      searchResults.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onChange(cat.id);
                            setIsOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
                        >
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cat.name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{getBreadcrumbPath(cat.id)}</p>
                          </div>
                          {value === cat.id && <Check size={16} className="text-[var(--color-brand)]" />}
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  // Drill-down view
                  <div className="space-y-1">
                    {history.length > 0 && (
                      <div className="border-b pb-2 mb-2">
                        <button
                          type="button"
                          onClick={handleBackClick}
                          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-sm font-semibold transition-colors hover:bg-[var(--glass-bg-strong)]"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          <ArrowLeft size={16} />
                          Back
                        </button>
                        <div className="px-3 pt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {history.map((h, index) => (
                            <span key={h.id}>
                              {index > 0 && ' › '}
                              {h.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View all / select parent option */}
                    {currentCategory && (
                      <button
                        type="button"
                        onClick={() => handleSelectParent(currentCategory)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[var(--glass-bg-strong)]"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <span>Select this category ({currentCategory.name})</span>
                        {value === currentCategory.id && <Check size={16} />}
                      </button>
                    )}

                    {displayItems.map((cat) => {
                      const hasChildren = cat.children && cat.children.length > 0;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleItemClick(cat)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
                        >
                          <span
                            className={hasChildren ? 'font-medium' : ''}
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {cat.name}
                          </span>
                          {hasChildren ? (
                            <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
                          ) : (
                            value === cat.id && <Check size={16} className="text-[var(--color-brand)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}