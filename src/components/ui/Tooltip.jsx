import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@lib/utils';

export default function Tooltip({ children, content, side = 'top', className }) {
  if (!content) return children;

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              'z-50 px-3 py-1.5 text-xs font-medium rounded-lg animate-fade-in',
              className
            )}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {content}
            <TooltipPrimitive.Arrow
              style={{ fill: 'var(--color-surface-elevated)' }}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}