import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';

export default function CategoryGrid() {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn:  () => CategoryService.getTree().then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  });

  if (!categories.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.slug}`}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}