import { TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SearchService from '@api/services/search.service';
import { queryKeys } from '@lib/queryClient';

export default function PopularSearches({ onSelect }) {
  const { data } = useQuery({
    queryKey: queryKeys.search.popular(),
    queryFn:  () => SearchService.getPopular().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const searches = data || [];
  if (!searches.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
        <TrendingUp size={11} /> Trending
      </p>
      <div className="flex flex-wrap gap-1.5">
        {searches.slice(0, 8).map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.query)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-[var(--glass-bg-strong)]"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {item.query}
          </button>
        ))}
      </div>
    </div>
  );
}