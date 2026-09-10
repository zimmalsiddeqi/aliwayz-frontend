import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Sparkles, ArrowRight, Compass } from 'lucide-react';
import Button from '@components/ui/Button';

export default function WantedSuccessStep({ createdRequest, onReset }) {
  const navigate = useNavigate();

  const {
    title = '3 Bedroom House',
    intent = 'buy',
    budget_min = 400000,
    budget_max = 550000,
    location_city = 'Philadelphia, PA',
    location_radius = 10,
    category = 'real_estate',
  } = createdRequest || {};

  const formatPrice = (val) => {
    if (!val || val === 0) return null;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val.toLocaleString()}`;
  };

  const minFormatted = formatPrice(budget_min);
  const maxFormatted = formatPrice(budget_max);
  const budgetStr = minFormatted && maxFormatted ? `${minFormatted} - ${maxFormatted}` : (maxFormatted || minFormatted || 'Flexible');
  const intentStr = intent.charAt(0).toUpperCase() + intent.slice(1);

  return (
    <div className="mx-auto max-w-md text-center py-6 sm:py-10 px-4">
      {/* Celebratory Icon */}
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
          <Home size={32} />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-gray-900">
          <CheckCircle2 size={20} />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
        Your Request is Live!
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
        We'll notify you when sellers, agents, or owners have an item or property that matches your exact criteria.
      </p>

      {/* Summary Card */}
      <div className="my-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Home size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[var(--color-text-primary)]">{title}</h4>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {intentStr} • {budgetStr}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              {location_city} {location_radius ? `(within ${location_radius} miles)` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Button
          variant="brand"
          className="w-full py-3 rounded-xl font-bold"
          onClick={() => navigate('/wanted/my-requests')}
        >
          View My Requests
        </Button>

        <Button
          variant="secondary"
          className="w-full py-3 rounded-xl font-bold"
          onClick={() => navigate('/wanted')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
