import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from '@components/ui/Avatar';
import { cn, formatChatTime } from '@lib/utils';
import { getOtherParticipant, getUnreadCount, getPrimaryImage } from '@utils/helpers';
import useAuthStore from '@store/auth.store';
import useChatStore from '@store/chat.store';

export default function ConversationCard({ conversation, index = 0 }) {
  const { user }      = useAuthStore();
  const { isUserOnline } = useChatStore();
  const other         = getOtherParticipant(conversation, user?.id);
  const unread        = getUnreadCount(conversation, user?.id);
  const product       = conversation.products;
  const productImage  = getPrimaryImage(product?.product_images);
  const online        = isUserOnline(other?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={`/inbox/${conversation.id}`}
        className={cn(
          'flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:bg-[var(--glass-bg-strong)]',
          unread > 0 && 'bg-[var(--glass-bg)]'
        )}
      >
        <div className="relative flex-shrink-0">
          <Avatar src={other?.avatar_url} name={other?.username} size="md" online={online} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={cn('text-sm truncate', unread > 0 ? 'font-bold' : 'font-medium')}
              style={{ color: 'var(--color-text-primary)' }}
            >
              {other?.username || 'User'}
            </h4>
            <span
              className="text-[11px] flex-shrink-0 ml-2"
              style={{ color: unread > 0 ? 'var(--color-brand)' : 'var(--color-text-muted)' }}
            >
              {conversation.last_message_at ? formatChatTime(conversation.last_message_at) : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <p
              className={cn('text-xs truncate flex-1', unread > 0 ? 'font-medium' : '')}
              style={{ color: unread > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
            >
              {conversation.last_message_preview || 'No messages yet'}
            </p>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>

          {product && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {productImage && <img src={productImage} alt="" className="w-4 h-4 rounded object-cover" />}
              <span className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                {product.title}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}