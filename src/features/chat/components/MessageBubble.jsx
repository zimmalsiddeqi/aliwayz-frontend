import { Star } from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import { cn, formatChatTime } from '@lib/utils';

export default function MessageBubble({ message, isMine, showAvatar, isSystem }) {
  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine && showAvatar && (
        <Avatar src={message.sender?.avatar_url} name={message.sender?.username} size="xs" className="mt-1" />
      )}
      {!isMine && !showAvatar && <div className="w-6" />}

      <div
        className={cn('max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl text-sm', isMine ? 'rounded-br-md' : 'rounded-bl-md', message.isPending && 'opacity-60')}
        style={{
          backgroundColor: isMine ? 'var(--color-brand)' : 'var(--color-surface-elevated)',
          color: isMine ? 'white' : 'var(--color-text-primary)',
          border: isMine ? undefined : '1px solid var(--color-border)',
        }}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px]" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>
            {formatChatTime(message.created_at)}
          </span>
          {isMine && (
            <span className="text-[10px]" style={{ color: message.is_read ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>
              {message.isPending ? '⏳' : message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}