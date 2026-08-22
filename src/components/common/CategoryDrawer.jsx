import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, ChevronRight, ArrowLeft, Search, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';

export default function CategoryDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Fetch full category tree
  const { data: treeData, isLoading } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: CategoryService.getTree,
    enabled: isOpen,
  });

  const categories = treeData?.data || [];

  // Navigation state: stack of category objects
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset drawer state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setHistory([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const currentCategory = history[history.length - 1] || null;

  // Preferred order: most used / popular categories first
  const PREFERRED_ORDER = [
    'electronics',
    'vehicles',
    'fashion',
    'home-furniture',
    'shoes',
    'beauty-personal-care',
    'baby-kids',
    'sports-outdoors',
    'toys-games',
    'computers-office',
    'auto-parts-accessories',
    'jewelry-watches',
    'books-movies-music',
    'appliances',
    'tools-equipment',
    'garden-outdoor',
    'pet-supplies',
    'musical-instruments',
    'hobbies-crafts',
    'collectibles-memorabilia',
    'handmade',
    'antiques-vintage',
    'business-commercial',
    'real-estate',
    'free-giveaway',
    'other',
  ];

  let displayCategories = [];
  if (currentCategory) {
    displayCategories = currentCategory.children || [];
  } else if (categories.length > 0) {
    // Sort top-level categories by preferred order, unknowns go to end
    const sorted = [...categories].sort((a, b) => {
      const ai = PREFERRED_ORDER.indexOf(a.slug);
      const bi = PREFERRED_ORDER.indexOf(b.slug);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    displayCategories = sorted;
  }

  const handleCategoryClick = (cat) => {
    if (cat.children && cat.children.length > 0) {
      setHistory([...history, cat]);
    } else {
      // Leaf category clicked
      navigate(`/category/${cat.slug}`);
      onClose();
    }
  };

  const handleBackClick = () => {
    setHistory(history.slice(0, -1));
  };

  const handleViewAllClick = (cat) => {
    navigate(`/category/${cat.slug}`);
    onClose();
  };

  // Helper to search flat list of categories recursively
  const getFlatCategories = (list) => {
    let flat = [];
    for (const item of list) {
      flat.push(item);
      if (item.children) {
        flat = flat.concat(getFlatCategories(item.children));
      }
    }
    return flat;
  };

  const allFlatCategories = getFlatCategories(categories);
  const searchResults = searchQuery.trim()
    ? allFlatCategories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return isOpen ? (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 top-0 z-50 flex w-[280px] sm:w-[320px] flex-col border-r shadow-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-[var(--color-brand)]" size={20} />
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Browse Categories
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 transition-colors hover:bg-[var(--glass-bg-strong)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="border-b p-3">
              <div className="relative flex items-center">
                <Search
                  size={16}
                  className="absolute left-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border py-2 pl-9 pr-3 text-xs outline-none transition-all focus:ring-2 focus:ring-[var(--color-brand)]"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {isLoading ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
                  <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Loading categories...
                  </span>
                </div>
              ) : searchQuery.trim() ? (
                // Search Results View
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-8 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      No matching categories found.
                    </div>
                  ) : (
                    searchResults.map((cat) => (
                      <button
                        key={`search-${cat.id}`}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          onClose();
                        }}
                        className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs transition-all duration-150 hover:bg-[var(--glass-bg-strong)] hover:translate-x-1"
                      >
                        <span style={{ color: 'var(--color-text-primary)' }}>{cat.name}</span>
                        <ChevronRight size={14} className="text-[var(--color-text-secondary)] transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Hierarchical Slider View
                <div className="space-y-0.5">
                  {/* Back Navigation & Breadcrumb */}
                  {history.length > 0 && (
                    <div className="border-b pb-2 mb-2">
                      <button
                        onClick={handleBackClick}
                        className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--glass-bg-strong)]"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                      <div className="px-2.5 pt-1.5 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                        {history.map((h, index) => (
                          <span key={`crumb-${h.id}`}>
                            {index > 0 && ' › '}
                            {h.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* "View All" Option (Level 2 or 3) */}
                  {currentCategory && (
                    <button
                      onClick={() => handleViewAllClick(currentCategory)}
                      className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs font-semibold transition-all duration-150 hover:bg-[var(--glass-bg-strong)] hover:translate-x-1"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      <span>View All {currentCategory.name}</span>
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}

                  {/* Category Children List */}
                  {displayCategories.map((cat) => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs transition-all duration-150 hover:bg-[var(--glass-bg-strong)] hover:translate-x-1"
                      >
                        <span
                          className={hasChildren ? 'font-medium' : ''}
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {cat.name}
                        </span>
                        {hasChildren && (
                          <ChevronRight size={14} className="text-[var(--color-text-secondary)] transition-transform group-hover:translate-x-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
      </div>
    </>
  ) : null;
}
