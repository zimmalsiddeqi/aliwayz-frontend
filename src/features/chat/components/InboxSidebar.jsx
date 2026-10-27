import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, X, Trash2, MessageCircle } from 'lucide-react';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useChatStore from '@store/chat.store';
import useAuthStore from '@store/auth.store';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { ConversationSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';
import { cn, formatChatTime, getErrorMessage } from '@lib/utils';
import { getOtherParticipant, getUnreadCount, getPrimaryImage } from '@utils/helpers';
import toast from '@lib/toast';

export default function InboxSidebar({ activeConversationId = null, className = '' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setConversations, onlineUsers } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteChat, setShowDeleteChat] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch conversations ───────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.conversations.all(),
    queryFn: () => ChatService.getConversations({ page: 1, limit: 50 }),
    refetchInterval: 15000,
  });

  const conversations = data?.data || [];

  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  // ── Delete conversation ───────────────────────────────────
  const deleteChatMutation = useMutation({
    mutationFn: (convId) => ChatService.archiveConversation(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() });
      if (deleteTarget?.id === activeConversationId) {
        navigate('/inbox');
      }
      setShowDeleteChat(false);
      setDeleteTarget(null);
      toast.success('Conversation deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const filteredConversations = searchQuery
    ? conversations.filter((conv) => {
        const other = getOtherParticipant(conv, user?.id);
        const isOtherSeller = Boolean(conv.seller_id === other?.id || conv.buyer_id === user?.id);
        const rawSellerStore =
          conv.products?.stores ||
          (conv.seller?.stores
            ? Array.isArray(conv.seller.stores)
              ? conv.seller.stores[0]
              : conv.seller.stores
            : null);
        const sellerStore = rawSellerStore || conv.seller_store || null;
        const storeName = isOtherSeller && sellerStore?.store_name ? sellerStore.store_name.toLowerCase() : '';

        return (
          other?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          storeName.includes(searchQuery.toLowerCase()) ||
          conv.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : conversations;

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden border-r border-[var(--color-border)] select-none',
        className
      )}
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      {/* ═══ TOP HEADER ═══════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)] flex-shrink-0"
        style={{ backgroundColor: 'var(--glass-bg-strong)' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Chats
          </h2>
          {conversations.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: 'var(--color-brand-glow)',
                color: 'var(--color-brand-light)',
              }}
            >
              {conversations.length}
            </span>
          )}
        </div>

        <Link
          to="/marketplace"
          className="text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
          style={{ color: 'var(--color-brand)' }}
          title="Browse listings"
        >
          <MessageCircle size={15} />
          <span className="hidden sm:inline">Browse</span>
        </Link>
      </div>

      {/* ═══ SEARCH BAR ═══════════════════════════════════ */}
      <div className="p-3 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat..."
            className="w-full text-xs rounded-xl py-2 pl-9 pr-8 outline-none transition-all duration-200 border border-[var(--color-border)] focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
            style={{
              backgroundColor: 'var(--color-input)',
              color: 'var(--color-text-primary)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ═══ CONVERSATIONS LIST ═══════════════════════════ */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
        {isLoading ? (
          <div className="p-3 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="💬"
              title={searchQuery ? 'No chats found' : 'No chats yet'}
              description={
                searchQuery
                  ? `No matches for "${searchQuery}"`
                  : 'Start chatting by messaging a seller about a listing you like!'
              }
              actionLabel={!searchQuery ? 'Explore Marketplace' : undefined}
              actionTo={!searchQuery ? '/marketplace' : undefined}
            />
          </div>
        ) : (
          <div className="space-y-0.5 p-1.5">
            {filteredConversations.map((conv, index) => {
              const other = getOtherParticipant(conv, user?.id);
              const unread = getUnreadCount(conv, user?.id);
              const product = conv.products;
              const productImage = getPrimaryImage(product?.product_images);
              const isOnline = other?.id ? onlineUsers.has(other.id) : false;
              const isCompleted = conv.status === 'completed';
              const isActive = conv.id === activeConversationId;

              const isOtherSeller = Boolean(conv.seller_id === other?.id || conv.buyer_id === user?.id);
              const rawSellerStore =
                product?.stores ||
                (conv.seller?.stores
                  ? Array.isArray(conv.seller.stores)
                    ? conv.seller.stores[0]
                    : conv.seller.stores
                  : null);
              const sellerStore = rawSellerStore || conv.seller_store || null;

              const displayName =
                isOtherSeller && sellerStore?.store_name
                  ? sellerStore.store_name
                  : other?.username || 'User';
              const displayAvatar =
                isOtherSeller && sellerStore?.logo_url ? sellerStore.logo_url : other?.avatar_url;

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.2) }}
                  className="group relative rounded-xl overflow-hidden"
                >
                  <Link
                    to={`/inbox/${conv.id}`}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all duration-150 relative border-l-4',
                      isActive
                        ? 'border-l-[var(--color-brand)] bg-[rgba(91,110,245,0.12)] shadow-sm'
                        : 'border-l-transparent hover:bg-[var(--glass-bg-strong)]',
                      !isActive && unread > 0 && 'bg-[var(--glass-bg)] font-medium'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={displayAvatar} name={displayName} size="md" online={isOnline} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4
                            className={cn(
                              'text-xs truncate',
                              unread > 0 || isActive ? 'font-bold' : 'font-medium'
                            )}
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {displayName}
                          </h4>
                          {isOtherSeller && sellerStore?.is_verified && (
                            <span className="text-[11px] flex-shrink-0" title="Verified Store">
                              ✅
                            </span>
                          )}
                          {isOnline && (
                            <span
                              className="text-[9px] font-semibold px-1 py-0.2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: 'rgba(16,185,129,0.15)',
                                color: 'var(--color-success)',
                              }}
                            >
                              Online
                            </span>
                          )}
                          {isCompleted && (
                            <span
                              className="text-[9px] font-semibold px-1 py-0.2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: 'rgba(16,185,129,0.1)',
                                color: 'var(--color-success)',
                              }}
                            >
                              Sold
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] flex-shrink-0 font-normal"
                          style={{
                            color: unread > 0 ? 'var(--color-brand)' : 'var(--color-text-muted)',
                          }}
                        >
                          {conv.last_message_at ? formatChatTime(conv.last_message_at) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={cn(
                            'text-xs truncate flex-1 font-normal',
                            unread > 0 ? 'font-semibold text-[var(--color-text-primary)]' : ''
                          )}
                          style={{
                            color: unread > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                          }}
                        >
                          {conv.last_message_preview || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <span
                            className="min-w-[18px] h-4.5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--color-brand)',
                              color: 'white',
                            }}
                          >
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>

                      {product && (
                        <div
                          className="flex items-center gap-1.5 mt-1 pt-1 border-t border-[var(--color-border-subtle)]"
                          style={{ opacity: 0.8 }}
                        >
                          {productImage && (
                            <img
                              src={productImage}
                              alt=""
                              className="w-3.5 h-3.5 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <span
                            className="text-[10px] truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {product.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(conv);
                      setShowDeleteChat(true);
                    }}
                    className="absolute right-2 top-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Delete conversation"
                  >
                    <Trash2 size={13} />
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
        onClose={() => {
          setShowDeleteChat(false);
          setDeleteTarget(null);
        }}
        title="Delete Conversation"
        description={`Are you sure you want to delete this conversation with ${
          getOtherParticipant(deleteTarget, user?.id)?.username || 'this user'
        }? Chat history will be removed.`}
        size="sm"
      >
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setShowDeleteChat(false);
              setDeleteTarget(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            isLoading={deleteChatMutation.isPending}
            onClick={() => {
              if (deleteTarget?.id) {
                deleteChatMutation.mutate(deleteTarget.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
