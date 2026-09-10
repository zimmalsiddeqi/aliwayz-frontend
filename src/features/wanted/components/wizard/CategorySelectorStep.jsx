import { Home, Car, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@lib/utils';

export default function CategorySelectorStep({ selectedCategory, onSelectCategory, onNext }) {
  const categories = [
    {
      id: 'real_estate',
      title: 'Real Estate',
      subtitle: 'Homes, Apartments, Condos, Commercial Spaces & Land',
      icon: Home,
      color: 'from-blue-600 via-indigo-600 to-indigo-700',
      badge: 'Popular',
    },
    {
      id: 'automotive',
      title: 'Vehicles & Automotive',
      subtitle: 'Cars, Trucks, SUVs, Electric Vehicles, Commercial & Motorcycles',
      icon: Car,
      color: 'from-amber-500 via-orange-500 to-red-500',
      badge: 'High Demand',
    },
    {
      id: 'marketplace',
      title: 'Marketplace & Products',
      subtitle: 'Electronics, Tools, Gadgets, Fashion, Furniture & All other items',
      icon: ShoppingBag,
      color: 'from-emerald-500 via-teal-600 to-cyan-600',
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 shadow-sm">
          <Sparkles size={24} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
          What are you looking for?
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          Choose a category to set up your wanted request with matching filters.
        </p>
      </div>

      {/* 3 Prominent Category Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'group relative cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200 flex items-center justify-between gap-4',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-indigo-400 hover:bg-[var(--color-bg-secondary)] shadow-sm'
              )}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div
                  className={cn(
                    'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200',
                    cat.color
                  )}
                >
                  <Icon size={24} className="sm:size-7 drop-shadow-sm" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </h3>
                    {cat.badge && (
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-[var(--color-bg-card)]'
                  )}
                >
                  {isSelected && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 w-full sm:w-auto justify-center"
        >
          <span>Continue to Details</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
