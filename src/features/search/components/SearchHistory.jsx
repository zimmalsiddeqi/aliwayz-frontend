import { Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SearchService from '@api/services/search.service';
import { queryKeys } from '@lib/queryClient';
import useSearchStore from '@store/search.store';
import useAuthStore from '@store/auth.store';

export default function SearchHistory({ history = [], onSelect }) {
  const qc                  = useQueryClient();
  const { clearRecentSearches } = useSearchStore();
  const { isAuthenticated } = useAuthStore();   // ← ADD

  const clearMutation = useMutation({
    mutationFn: SearchService.clearHistory,
    onSuccess:  () => {
      clearRecentSearches();
      qc.invalidateQueries({ queryKey: queryKeys.search.history() });
    },
  });

  // ✅ Don't render at all if not authenticated
  if (!isAuthenticated || !history.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Recent
        </p>
        <button
          onClick={() => clearMutation.mutate()}
          className="text-xs hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Clear
        </button>
      </div>

      {history.slice(0, 8).map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(typeof item === 'string' ? item : item.query)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--glass-bg-strong)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
          <span className="flex-1 text-left truncate">
            {typeof item === 'string' ? item : item.query}
          </span>
        </button>
      ))}
    </div>
  );
}