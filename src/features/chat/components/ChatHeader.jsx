import { Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import TypingIndicator from './TypingIndicator';
import OnlineIndicator from './OnlineIndicator';

export default function ChatHeader({ other, product, isOnline, isTyping, onBack, onMenu }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
         style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)' }}>
      <button onClick={onBack} className="p-1.5 rounded-lg md:hidden" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={20} />
      </button>

      <Link to={`/user/${other?.username}`} className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="relative">
          <Avatar src={other?.avatar_url} name={other?.username} size="sm" />
          <OnlineIndicator online={isOnline} size="sm" className="absolute -bottom-0.5 -right-0.5 border-2 border-[var(--color-surface)]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
            {other?.username || 'User'}
          </h3>
          {isTyping ? (
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-brand)' }}>typing...</p>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </Link>

      {product && (
        <Link to={`/product/${product.id}`} className="hidden sm:block text-xs truncate max-w-[100px] text-right" style={{ color: 'var(--color-text-muted)' }}>
          {product.title}
        </Link>
      )}

      <button onClick={onMenu} className="p-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)]" style={{ color: 'var(--color-text-muted)' }}>
        <MoreVertical size={18} />
      </button>
    </div>
  );
}