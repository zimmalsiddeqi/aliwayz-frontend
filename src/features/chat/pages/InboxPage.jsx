import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, X, Trash2 } from 'lucide-react';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useChatStore from '@store/chat.store';
import useAuthStore from '@store/auth.store';
import Avatar from '@components/ui/Avatar';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import EmptyState from '@components/common/EmptyState';
import PageHeader from '@components/common/PageHeader';
import { ConversationSkeleton } from '@components/ui/Skeleton';
import { cn, formatChatTime, getErrorMessage } from '@lib/utils';
import { getOtherParticipant, getUnreadCount, getPrimaryImage } from '@utils/helpers';
import toast from '@lib/toast';

const STARTER_MESSAGES = [
  'Hi! Is this still available?',
  'Hello, I am interested in this item. Can we discuss?',
  'Hey! What is the lowest price you would accept?',
  'Hi there! Can I come see this in person?',
  'Hello! Is the price negotiable?',
  'Hey, can you tell me more about the condition?',
];

export default function InboxPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }             = useAuthStore();
  const { setConversations, onlineUsers } = useChatStore();

  const [searchQuery, setSearchQuery]         = useState('');
  const [showDeleteChat, setShowDeleteChat]   = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  // ── Show start chat modal when product param exists ─────
  // NO auto-send — user must choose message


  // ── Create conversation mutation ──────────────────────────
  const createConversation = useMutation({
    mutationFn: (data) => ChatService.createConversation(data),
    onSuccess: (response) => {
      const conv = response.data;
      setShowStartChat(false);
      setSelectedMessage('');
      navigate(`/inbox/${conv.id}`, { replace: true });
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.includes('own product') || msg.includes('yourself')) {
        toast.error('You cannot message yourself about your own listing');
      } else {
        toast.error('Failed to start conversation');
      }
    },
  });

  // ── Delete conversation ───────────────────────────────────
  const deleteChatMutation = useMutation({
    mutationFn: (convId) => ChatService.archiveConversation(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() });
      setShowDeleteChat(false);
      setDeleteTarget(null);
      toast.success('Conversation deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Fetch conversations ───────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.conversations.all(),
    queryFn:  () => ChatService.getConversations({ page: 1, limit: 50 }),
    refetchInterval: 15000,
  });

  const conversations = data?.data || [];

  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  const filteredConversations = searchQuery
    ? conversations.filter((conv) => {
        const other = getOtherParticipant(conv, user?.id);
        return (
          other?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : conversations;

  return (
    <>
      <Helmet>
        <title>Inbox — Aliwayz</title>
      </Helmet>

      <div className="container-app py-6 max-w-2xl">
        <PageHeader
          title="Inbox"
          subtitle={`${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
        />

        {conversations.length > 3 && (
          <div className="mb-4 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="input-base pl-10 pr-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title={searchQuery ? 'No conversations found' : 'No conversations yet'}
            description={searchQuery ? `No results for "${searchQuery}"` : 'Start chatting by messaging a seller about a product you like!'}
            actionLabel={!searchQuery ? 'Browse Marketplace' : undefined}
            actionTo={!searchQuery ? '/marketplace' : undefined}
          />
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv, index) => {
              const other   = getOtherParticipant(conv, user?.id);
              const unread  = getUnreadCount(conv, user?.id);
              const product = conv.products;
              const productImage = getPrimaryImage(product?.product_images);
              const isOnline = other?.id ? onlineUsers.has(other.id) : false;
              const isCompleted = conv.status === 'completed';

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group relative"
                >
                  <Link
                    to={`/inbox/${conv.id}`}
                    className={cn('flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 hover:bg-[var(--glass-bg-strong)]', unread > 0 && 'bg-[var(--glass-bg)]')}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={other?.avatar_url} name={other?.username} size="md" online={isOnline} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={cn('text-sm truncate', unread > 0 ? 'font-bold' : 'font-medium')} style={{ color: 'var(--color-text-primary)' }}>
                            {other?.username || 'User'}
                          </h4>
                          {isOnline && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                              Online
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>
                              ✅ Sold
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] flex-shrink-0 ml-2" style={{ color: unread > 0 ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
                          {conv.last_message_at ? formatChatTime(conv.last_message_at) : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={cn('text-xs truncate flex-1', unread > 0 ? 'font-medium' : '')} style={{ color: unread > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {conv.last_message_preview || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <motion.span className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-brand)', color: 'white' }} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            {unread > 9 ? '9+' : unread}
                          </motion.span>
                        )}
                      </div>

                      {product && (
                        <div className="flex items-center gap-1.5 mt-1.5" style={{ opacity: 0.7 }}>
                          {productImage && <img src={productImage} alt="" className="w-4 h-4 rounded object-cover" />}
                          <span className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{product.title}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(conv); setShowDeleteChat(true); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ DELETE CHAT MODAL ════════════════════════════ */}
      <Modal
        isOpen={showDeleteChat}
        onClose={() => { setShowDeleteChat(false); setDeleteTarget(null); }}
        title="Delete Conversation"
        description={`Delete your conversation with @${getOtherParticipant(deleteTarget, user?.id)?.username || 'this user'}?`}
        size="sm"
      >
        <div className="flex gap-3 mt-4">
          <Button variant="outline" fullWidth onClick={() => { setShowDeleteChat(false); setDeleteTarget(null); }}>Cancel</Button>
          <Button variant="danger" fullWidth isLoading={deleteChatMutation.isPending} loadingText="Deleting..." onClick={() => deleteTarget && deleteChatMutation.mutate(deleteTarget.id)}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}