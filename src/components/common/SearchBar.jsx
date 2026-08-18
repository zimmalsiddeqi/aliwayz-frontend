import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '@hooks/useDebounce';
import useOnClickOutside from '@hooks/useOnClickOutside';
import useSearchStore from '@store/search.store';
import useAuthStore from '@store/auth.store';
import SearchService from '@api/services/search.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import { cn } from '@lib/utils';

export default function SearchBar({ className, autoFocus = false, onClose }) {
  const navigate            = useNavigate();
  const containerRef        = useRef(null);
  const inputRef            = useRef(null);
  const { isAuthenticated } = useAuthStore();      // ← ADD THIS

  const {
    query, setQuery, addRecentSearch,
    recentSearches, setRecentSearches,
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFocused, setIsFocused]   = useState(false);
  const debouncedQuery = useDebounce(localQuery, 250);

  // Fetch flat categories for the dropdown
  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.flat(),
    queryFn: () => CategoryService.getFlat().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  const showDropdown = isFocused && (
    debouncedQuery.length > 0 || recentSearches.length > 0
  );

  // ── Suggestions (public — no auth needed) ─────────────────
  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.search.suggestions(debouncedQuery),
    queryFn:  () =>
      SearchService.getSuggestions({ q: debouncedQuery }).then((r) => r.data),
    enabled:   debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  // ── Popular searches (public — no auth needed) ─────────────
  const { data: popularSearches = [] } = useQuery({
    queryKey: queryKeys.search.popular(),
    queryFn:  () => SearchService.getPopular().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // ── Recent searches (REQUIRES AUTH) ────────────────────────
  // ✅ FIX: Only call this API when user is logged in
  const { data: recentData } = useQuery({
    queryKey: queryKeys.search.history(),
    queryFn:  () => SearchService.getHistory().then((r) => r.data),
    enabled:  isAuthenticated,                     // ← KEY FIX
    staleTime: 60000,
  });

  useEffect(() => {
    if (recentData) {
      setRecentSearches(recentData.map((r) => r.query));
    }
  }, [recentData, setRecentSearches]);

  useOnClickOutside(containerRef, () => setIsFocused(false));

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleSearch = useCallback((searchTerm) => {
    const term = searchTerm || localQuery;
    if (!term.trim()) return;
    addRecentSearch(term.trim());
    setQuery(term.trim());
    setIsFocused(false);
    
    let searchUrl = `/search?q=${encodeURIComponent(term.trim())}`;
    if (selectedCategory) {
      searchUrl += `&category_id=${encodeURIComponent(selectedCategory)}`;
    }
    navigate(searchUrl);
    
    if (onClose) onClose();
  }, [localQuery, navigate, addRecentSearch, setQuery, onClose, selectedCategory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="flex flex-col sm:flex-row items-stretch rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-brand)] focus-within:border-[var(--color-brand)] overflow-hidden transition-all">
        {/* Category dropdown */}
        <div className="relative border-b sm:border-b-0 sm:border-r border-[var(--color-border)] h-11 sm:h-12 flex items-center bg-[var(--glass-bg)] px-3 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-xs font-semibold pr-6 py-2 outline-none appearance-none cursor-pointer text-[var(--color-text-primary)] w-full sm:w-auto min-w-[120px]"
          >
            <option value="">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
        </div>

        {/* Input field */}
        <div className="flex flex-1 items-center h-11 sm:h-12 relative">
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, vehicles, homes..."
            className="w-full h-full bg-transparent pl-4 pr-10 text-sm outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            autoComplete="off"
          />
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Unified Search button */}
        <button
          onClick={() => handleSearch()}
          aria-label="Search"
          className="flex items-center justify-center bg-[var(--color-brand)] hover:brightness-110 text-white h-11 sm:h-12 px-5 transition-all shrink-0 cursor-pointer"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
              boxShadow:       'var(--shadow-xl)',
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Live suggestions */}
            {debouncedQuery.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <Search
                      size={14}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <span className="flex-1 truncate">{suggestion}</span>
                    <ArrowRight
                      size={12}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches — only shown when authenticated */}
            {!debouncedQuery && isAuthenticated && recentSearches.length > 0 && (
              <div className="p-2">
                <p
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Recent
                </p>
                {recentSearches.slice(0, 5).map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Clock
                      size={14}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                    <span className="flex-1 truncate">{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches — always visible */}
            {!debouncedQuery && popularSearches.length > 0 && (
              <div
                className="p-2"
                style={{
                  borderTop: recentSearches.length > 0 && isAuthenticated
                    ? '1px solid var(--color-border-subtle)'
                    : undefined,
                }}
              >
                <p
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Trending
                </p>
                <div className="flex flex-wrap gap-1.5 px-3 py-1">
                  {popularSearches.slice(0, 8).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item.query)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--glass-bg-strong)',
                        color:           'var(--color-text-secondary)',
                        border:          '1px solid var(--color-border)',
                      }}
                    >
                      <TrendingUp size={10} />
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {debouncedQuery.length >= 2 && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No suggestions found
                </p>
                <button
                  onClick={() => handleSearch()}
                  className="text-xs font-medium mt-2 hover:underline"
                  style={{ color: 'var(--color-brand)' }}
                >
                  Search for &quot;{debouncedQuery}&quot; →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}