import { Home, Car, Smartphone, Shirt, Sofa, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@lib/utils';

export default function CategorySelectorStep({ selectedCategory, onSelectCategory, onNext }) {
  const categories = [
    {
      id: 'real_estate',
      title: 'Real Estate',
      subtitle: 'Homes, Apartments, Land, Commercial',
      icon: Home,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Popular',
    },
    {
      id: 'automotive',
      title: 'Vehicles & Automotive',
      subtitle: 'Cars, Trucks, SUVs, Electric, Bikes',
      icon: Car,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'marketplace',
      title: 'Marketplace & Tech',
      subtitle: 'Electronics, Tools, Cameras, Hardware',
      icon: Smartphone,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'fashion',
      title: 'Fashion & Luxury',
      subtitle: 'Clothing, Shoes, Handbags, Watches',
      icon: Shirt,
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: 'home',
      title: 'Home & Furniture',
      subtitle: 'Living room, Appliances, Kitchen, Patio',
      icon: Sofa,
      color: 'from-purple-500 to-violet-600',
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4 sm:space-y-5">
      {/* Compact Header */}
      <div className="text-center space-y-1">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
          <Sparkles size={20} />
        </div>
        <h2 className="text-lg sm:text-xl font-black text-[var(--color-text-primary)]">
          What are you looking for?
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Choose a category to set up your wanted request.
        </p>
      </div>

      {/* Compact Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'group relative cursor-pointer rounded-2xl border p-2.5 sm:p-3 transition-all duration-200 flex items-center justify-between gap-2.5',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-indigo-400 hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-sm shrink-0',
                    cat.color
                  )}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-[var(--color-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {cat.title}
                    </h3>
                    {cat.badge && (
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              {isSelected && (
                <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 w-full sm:w-auto justify-center"
        >
          <span>Continue to Details</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
