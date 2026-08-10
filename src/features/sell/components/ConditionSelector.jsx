import { Controller } from 'react-hook-form';
import { cn } from '@lib/utils';
import { CONDITIONS } from '@utils/constants';

export default function ConditionSelector({ control, name = 'condition', error }) {
  return (
    <div className="space-y-1.5">
      <label className="floating-label">Condition</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => field.onChange(c.value)}
                className={cn('py-2 px-3 rounded-xl text-xs font-medium text-center transition-all duration-200')}
                style={{
                  backgroundColor: field.value === c.value ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                  border: `1px solid ${field.value === c.value ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  color: field.value === c.value ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      />
      {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}