import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '@hooks/useDebounce';
import useOnClickOutside from '@hooks/useOnClickOutside';
import useSearchStore from '@store/search.store';
import useAuthStore from '@store/auth.store';
import SearchService from '@api/services/search.service';
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
  const [isFocused, setIsFocused]   = useState(false);
  const debouncedQuery = useDebounce(localQuery, 250);

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
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    if (onClose) onClose();
  }, [localQuery, navigate, addRecentSearch, setQuery, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            color: isFocused
              ? 'var(--color-brand)'
              : 'var(--color-text-muted)',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, stores..."
          className="input-base pl-10 pr-10"
          autoComplete="off"
        />
        {localQuery && (
          <button
            onClick={() => {
              setLocalQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        )}
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