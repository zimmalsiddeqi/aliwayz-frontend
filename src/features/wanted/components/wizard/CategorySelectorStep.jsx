import { Home, Car, Smartphone, Shirt, Sofa, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@lib/utils';

export default function CategorySelectorStep({ selectedCategory, onSelectCategory, onNext }) {
  const categories = [
    {
      id: 'real_estate',
      title: 'Real Estate',
      subtitle: 'Homes, Apartments, Land, Commercial spaces',
      icon: Home,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Popular',
    },
    {
      id: 'automotive',
      title: 'Vehicles & Automotive',
      subtitle: 'Cars, Trucks, SUVs, Electric vehicles, Motorcycles',
      icon: Car,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'marketplace',
      title: 'Marketplace & Essentials',
      subtitle: 'Electronics, Tools, Cameras, Hardware, General goods',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'fashion',
      title: 'Fashion & Luxury',
      subtitle: 'Designer clothing, Shoes, Handbags, Watches',
      icon: Shirt,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'home',
      title: 'Home & Furniture',
      subtitle: 'Living room sets, Appliances, Kitchen, Patio',
      icon: Sofa,
      color: 'from-purple-500 to-violet-600',
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
          <Sparkles size={24} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          What category are you looking for?
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
          Select a category to customize your wanted request with the exact right filters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'group relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 flex flex-col justify-between',
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-600/20'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-sm',
                    cat.color
                  )}
                >
                  <Icon size={20} />
                </div>
                {cat.badge && (
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {cat.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
        >
          <span>Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
