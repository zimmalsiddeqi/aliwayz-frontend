import { useRef } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@lib/utils';

export default function MessageInput({ value, onChange, onSend, onTypingStart, onTypingStop, disabled }) {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3"
         style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)' }}>
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={onTypingStart}
        onBlur={onTypingStop}
        placeholder="Type a message..."
        rows={1}
        disabled={disabled}
        className="input-base resize-none max-h-32 min-h-[44px]"
        style={{ paddingTop: '10px', paddingBottom: '10px' }}
      />
      <button
        onClick={onSend}
        disabled={!value?.trim() || disabled}
        className={cn('p-2.5 rounded-xl transition-all duration-200 flex-shrink-0',
          value?.trim() ? 'bg-[var(--color-brand)] text-white hover:brightness-110' : 'text-[var(--color-text-muted)] cursor-not-allowed'
        )}
      >
        <Send size={18} />
      </button>
    </div>
  );
}