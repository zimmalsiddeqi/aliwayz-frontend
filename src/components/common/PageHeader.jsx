import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  backTo,
  showBack = false,
  rightAction,
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="p-2 rounded-xl transition-colors flex-shrink-0 hover:bg-[var(--glass-bg-strong)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-bold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-sm mt-0.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </div>
  );
}