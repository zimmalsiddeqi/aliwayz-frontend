import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Ban,
  QrCode,
  ScanLine,
  CheckCircle,
  Star,
  X,
  ChevronRight,
  AlertCircle,
  Clock,
  WifiOff,
  MessageCircle,
} from 'lucide-react';
import ChatService from '@api/services/chat.service';
import QRService from '@api/services/qr.service';
import ReviewService from '@api/services/review.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useChatStore from '@store/chat.store';
import useConversationSocket from '@hooks/useSocket';
import { getSocket, SOCKET_EVENTS } from '@lib/socket';
import { Html5Qrcode } from 'html5-qrcode';
import Avatar from '@components/ui/Avatar';
import Spinner from '@components/ui/Spinner';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { cn, formatChatTime, isSeller, getErrorMessage } from '@lib/utils';
import { getOtherParticipant, getPrimaryImage } from '@utils/helpers';
import { formatPrice } from '@utils/formatters';
import toast from '@lib/toast';

export default function ConversationPage() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    messages: storeMessages,
    setMessages,
    addOptimisticMessage,
    onlineUsers,
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [prefillToken, setPrefillToken] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [qrReadyAlert, setQrReadyAlert] = useState(false);

  const handleOpenReviewModal = useCallback(() => {
    let currentTId = transactionId;
    if (!currentTId && convData?.data?.qr_transactions?.length > 0) {
      const completedQR = convData.data.qr_transactions.find(qr => qr.status === 'completed');
      if (completedQR) {
        currentTId = completedQR.id;
        setTransactionId(currentTId);
      }
    }
    setShowReviewModal(true);
  }, [transactionId, convData?.data]);

  // ── Socket hook ────────────────────────────────────────
  const {
    isConnected,
    isJoined,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markRead,
    typingUserIds,
  } = useConversationSocket(conversationId);

  // ── Fetch conversation ─────────────────────────────────
  const { data: convData } = useQuery({
    queryKey: queryKeys.conversations.byId(conversationId),
    queryFn: () => ChatService.getConversation(conversationId),
    enabled: !!conversationId,
  });

  const conversation = convData?.data;
  const product = conversation?.products;
  const other = conversation ? getOtherParticipant(conversation, user?.id) : null;

  const isProductSeller = user?.id === conversation?.seller_id;
  const isProductBuyer = user?.id === conversation?.buyer_id;
  const isCompleted = conversation?.status === 'completed' || saleCompleted;
  const isOtherOnline = other?.id ? onlineUsers.has(other.id) : false;

  // ── Fetch messages ─────────────────────────────────────
  const { data: msgData, isLoading: messagesLoading } = useQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: () => ChatService.getMessages(conversationId, { page: 1, limit: 100 }),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (msgData?.data) {
      setMessages(conversationId, msgData.data);
    }
  }, [msgData, conversationId, setMessages]);

  const messages = storeMessages[conversationId] || [];

  // ── Listen for QR events via socket ────────────────────
  // QR events listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleQRScanned = (data) => {
      if (data.conversationId === conversationId) {
        setSaleCompleted(true);
        setTransactionId(data.transactionId || data.transaction_id);
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.byId(conversationId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.messages(conversationId),
        });
        setTimeout(() => handleOpenReviewModal(), 1500);
        toast.success('🎉 Deal completed!');
      }
    };

    const handleQRGenerated = (data) => {
      if (data.conversationId === conversationId && isProductBuyer) {
        setQrReadyAlert(true);
        toast.success('Seller generated a QR code! Check the chat.', {
          duration: 6000,
          icon: '📱',
        });
      }
    };

    socket.on(SOCKET_EVENTS.QR_SCANNED, handleQRScanned);
    socket.on('qr_generated', handleQRGenerated);

    return () => {
      socket.off(SOCKET_EVENTS.QR_SCANNED, handleQRScanned);
      socket.off('qr_generated', handleQRGenerated);
    };
  }, [conversationId, isProductBuyer, queryClient]);

  // ── Auto-scroll to bottom ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message handler ───────────────────────────────
  const handleSendMessage = useCallback(() => {
    const content = input.trim();
    if (!content) return;

    const tempId = addOptimisticMessage(conversationId, content, user.id, {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
    });

    const sent = socketSendMessage(content, tempId);
    if (!sent) {
      toast.error('Connection lost. Reconnecting...');
      return;
    }

    setInput('');
    inputRef.current?.focus();
    stopTyping();
  }, [input, conversationId, user, addOptimisticMessage, socketSendMessage, stopTyping]);

  // ── Input change with typing indicator ─────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── QR bubble scan handler ─────────────────────────────
  const handleQRBubbleScan = (token) => {
    setPrefillToken(token);
    setShowQRScanner(true);
  };

  const productImage = getPrimaryImage(product?.product_images);

  return (
    <>
      <Helmet>
        <title>{other?.username || 'Chat'} — Aliwayz</title>
      </Helmet>

      <div
        className="flex flex-col"
        style={{
          height: 'calc(100vh - var(--navbar-height) - 4rem)',
        }}
      >
        {/* ═══ HEADER ═════════════════════════════════════ */}
        <div
          className="flex flex-shrink-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
          style={{
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--glass-bg-strong)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/inbox')}
            className="flex-shrink-0 rounded-lg p-1.5 md:hidden"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* User info */}
          <Link
            to={`/user/${other?.username}`}
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5"
          >
            <div className="relative flex-shrink-0">
              <Avatar
                src={other?.avatar_url}
                name={other?.username}
                size="sm"
                online={isOtherOnline}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="truncate text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {other?.username || 'User'}
                </h3>

                {/* Online status text */}
                {isOtherOnline && !isCompleted && (
                  <span
                    className="hidden flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:inline"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.15)',
                      color: 'var(--color-success)',
                    }}
                  >
                    Online
                  </span>
                )}
              </div>

              {/* Status line */}
              <div className="flex items-center gap-1.5">
                {typingUserIds.length > 0 ? (
                  <motion.p
                    className="flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color: 'var(--color-brand)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      typing
                    </motion.span>
                    <span className="flex gap-[2px]">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="inline-block h-[3px] w-[3px] rounded-full"
                          style={{
                            backgroundColor: 'var(--color-brand)',
                          }}
                          animate={{ y: [0, -2, 0] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </span>
                  </motion.p>
                ) : (
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {isCompleted ? '✅ Deal completed' : isOtherOnline ? 'Active now' : 'Offline'}
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Connection indicator */}
          {!isConnected && (
            <div
              className="flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1"
              style={{
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <WifiOff size={10} style={{ color: 'var(--color-warning)' }} />
              <span className="text-[9px] font-medium" style={{ color: 'var(--color-warning)' }}>
                Connecting
              </span>
            </div>
          )}

          {/* Product chip */}
          {product && (
            <Link
              to={`/product/${product.id}`}
              className="hidden max-w-[150px] flex-shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[var(--glass-bg-strong)] sm:flex"
              style={{ border: '1px solid var(--color-border)' }}
            >
              {productImage && (
                <img src={productImage} alt="" className="h-6 w-6 rounded object-cover" />
              )}
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {product.title}
                </p>
                <p className="font-bold" style={{ color: 'var(--color-brand)' }}>
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
            </Link>
          )}

          {/* Options menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 transition-colors hover:bg-[var(--glass-bg-strong)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute right-0 top-full z-40 mt-1 w-48 rounded-xl p-1.5"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  >
                    {product && (
                      <Link
                        to={`/product/${product.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[var(--glass-bg-strong)]"
                        style={{
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <ChevronRight size={14} /> View Product
                      </Link>
                    )}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--glass-bg-strong)]"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Ban size={14} /> Block User
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ═══ SALE COMPLETE BANNER ═══════════════════════ */}
        {isCompleted && (
          <motion.div
            className="mx-3 my-2 rounded-2xl p-3 sm:mx-4 sm:p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}
              >
                <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                  🎉 Deal Completed!
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Product marked as sold.
                </p>
              </div>
              <Button
                size="xs"
                onClick={() => handleOpenReviewModal()}
                leftIcon={<Star size={12} />}
                className="flex-shrink-0"
              >
                Review
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══ QR READY ALERT (buyer) ═════════════════════ */}
        {qrReadyAlert && !isCompleted && isProductBuyer && (
          <motion.div
            className="mx-3 my-2 flex items-center gap-3 rounded-xl p-3 sm:mx-4"
            style={{
              background: 'linear-gradient(135deg, rgba(91,110,245,0.15), rgba(91,110,245,0.05))',
              border: '1px solid rgba(91,110,245,0.3)',
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QrCode size={18} style={{ color: 'var(--color-brand)' }} />
            <p className="flex-1 text-xs font-medium" style={{ color: 'var(--color-brand-light)' }}>
              QR code in chat below ↓ Tap "Scan & Confirm"
            </p>
            <button
              onClick={() => setQrReadyAlert(false)}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* ═══ MESSAGES ═══════════════════════════════════ */}
        <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-4 sm:px-4">
          {messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: 'var(--color-brand-glow)',
                }}
              >
                <MessageCircle size={24} style={{ color: 'var(--color-brand)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Start the conversation!
              </p>
              {product && (
                <p
                  className="max-w-xs text-center text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Ask about {product.title}
                </p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender_id === user?.id;
              const isSystem = msg.content_type === 'system';
              const isQR = msg.content_type === 'qr_code';
              const showAvatar =
                !isMine && (index === 0 || messages[index - 1]?.sender_id !== msg.sender_id);

              // ── System message ─────────────────────
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center py-2">
                    <span
                      className="max-w-[90%] rounded-full px-4 py-1.5 text-center text-xs"
                      style={{
                        backgroundColor: 'var(--glass-bg)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {msg.content}
                    </span>
                  </div>
                );
              }

              // ── QR code message ────────────────────
              if (isQR) {
                return (
                  <QRMessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={isMine}
                    showAvatar={showAvatar}
                    sender={msg.sender}
                    onScanClick={handleQRBubbleScan}
                  />
                );
              }

              // ── Regular text message ───────────────
              return (
                <motion.div
                  key={msg.id}
                  className={cn('flex gap-1.5 sm:gap-2', isMine ? 'justify-end' : 'justify-start')}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {!isMine && showAvatar && (
                    <Avatar
                      src={msg.sender?.avatar_url}
                      name={msg.sender?.username}
                      size="xs"
                      className="mt-1 flex-shrink-0"
                    />
                  )}
                  {!isMine && !showAvatar && <div className="w-6 flex-shrink-0" />}

                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm sm:max-w-[65%] sm:px-3.5 sm:py-2.5',
                      isMine ? 'rounded-br-md' : 'rounded-bl-md',
                      msg.isPending && 'opacity-60'
                    )}
                    style={{
                      backgroundColor: isMine
                        ? 'var(--color-brand)'
                        : 'var(--color-surface-elevated)',
                      color: isMine ? 'white' : 'var(--color-text-primary)',
                      border: isMine ? undefined : '1px solid var(--color-border)',
                    }}
                  >
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed sm:text-sm">
                      {msg.content}
                    </p>

                    {/* Time + delivery status */}
                    <div
                      className={cn(
                        'mt-1 flex items-center gap-1',
                        isMine ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span
                        className="text-[10px]"
                        style={{
                          color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                        }}
                      >
                        {formatChatTime(msg.created_at)}
                      </span>

                      {/* Delivery indicators */}
                      {isMine && (
                        <span
                          className="text-[10px]"
                          style={{
                            color: msg.is_read
                              ? 'rgba(255,255,255,0.9)'
                              : msg.isPending
                                ? 'rgba(255,255,255,0.3)'
                                : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {msg.isPending ? '⏳' : msg.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* ── Typing indicator ──────────────────────── */}
          <AnimatePresence>
            {typingUserIds.length > 0 && (
              <motion.div
                className="flex items-center gap-2 pl-8"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
              >
                <div
                  className="flex gap-[3px] rounded-2xl px-3 py-2.5"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-[5px] w-[5px] rounded-full"
                      style={{
                        backgroundColor: 'var(--color-brand)',
                      }}
                      animate={{
                        y: [0, -5, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {other?.username} is typing...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ═══ QR ACTION BAR ══════════════════════════════ */}
        {!isCompleted && product && product.status !== 'sold' && (
          <div
            className="flex flex-shrink-0 items-center gap-2 px-3 py-2 sm:px-4"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--glass-bg)',
            }}
          >
            {isProductSeller && (
              <Button
                size="sm"
                leftIcon={<QrCode size={14} />}
                onClick={() => setShowQRGenerator(true)}
                className="flex-shrink-0"
              >
                <span className="hidden sm:inline">Generate QR</span>
                <span className="sm:hidden">QR</span>
              </Button>
            )}

            {isProductBuyer && (
              <Button
                size="sm"
                variant="brand"
                leftIcon={<ScanLine size={14} />}
                onClick={() => {
                  setPrefillToken('');
                  setShowQRScanner(true);
                }}
                className="flex-shrink-0"
              >
                <span className="hidden sm:inline">Scan QR</span>
                <span className="sm:hidden">Scan</span>
              </Button>
            )}

            <p
              className="truncate text-[10px] sm:text-[11px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {isProductSeller ? 'Generate QR to finalize sale' : "Scan seller's QR to confirm"}
            </p>
          </div>
        )}

        {/* ═══ MESSAGE INPUT ══════════════════════════════ */}
        {conversation?.status !== 'blocked' ? (
          <div
            className="flex flex-shrink-0 items-end gap-2 px-3 py-2.5 sm:px-4 sm:py-3"
            style={{
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--glass-bg-strong)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
              disabled={!isConnected}
              rows={1}
              className="input-base max-h-32 min-h-[40px] resize-none text-sm sm:min-h-[44px]"
              style={{
                paddingTop: '10px',
                paddingBottom: '10px',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || !isConnected}
              className={cn(
                'flex-shrink-0 rounded-xl p-2 transition-all duration-200 sm:p-2.5',
                input.trim() && isConnected
                  ? 'bg-[var(--color-brand)] text-white hover:brightness-110'
                  : 'cursor-not-allowed text-[var(--color-text-muted)]'
              )}
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-shrink-0 items-center justify-center px-4 py-4"
            style={{
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--glass-bg)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              🚫 This conversation has been blocked.
            </p>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══════════════════════════════════════ */}

      {/* QR Generator (Seller) */}
      {showQRGenerator && (
        <QRGeneratorModal
          isOpen={showQRGenerator}
          onClose={() => setShowQRGenerator(false)}
          product={product}
          buyerId={conversation?.buyer_id}
        />
      )}

      {/* QR Scanner (Buyer) */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          prefillToken={prefillToken}
          productId={product?.id}
          onSuccess={(result) => {
            setSaleCompleted(true);
            setTransactionId(result.transaction_id);
            setTimeout(() => handleOpenReviewModal(), 1500);
            toast.success('🎉 Purchase confirmed!');
          }}
        />
      )}

      {/* Review */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          transactionId={transactionId}
          reviewerType={isProductBuyer ? 'buyer' : 'seller'}
        />
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// QR MESSAGE BUBBLE
// ──────────────────────────────────────────────────────────────
function QRMessageBubble({ message, isMine, showAvatar, sender, onScanClick }) {
  let qrData = null;
  try {
    qrData = JSON.parse(message.content);
  } catch {
    return null;
  }

  if (!qrData || qrData.type !== 'qr_verification') return null;

  const isExpired = new Date(qrData.expiresAt) < new Date();
  const expireTime = new Date(qrData.expiresAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex gap-1.5 sm:gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine && showAvatar && (
        <Avatar
          src={sender?.avatar_url}
          name={sender?.username}
          size="xs"
          className="mt-1 flex-shrink-0"
        />
      )}
      {!isMine && !showAvatar && <div className="w-6 flex-shrink-0" />}

      <motion.div
        className="max-w-[85%] overflow-hidden rounded-2xl sm:max-w-[75%]"
        style={{
          border: `1px solid ${isExpired ? 'var(--color-border)' : 'rgba(91,110,245,0.4)'}`,
          backgroundColor: isMine ? 'rgba(91,110,245,0.1)' : 'var(--color-surface-elevated)',
          boxShadow: isExpired ? 'none' : '0 4px 20px rgba(91,110,245,0.15)',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 pb-2 pt-2.5 sm:px-4"
          style={{
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: isExpired
                ? 'var(--color-surface-overlay)'
                : 'var(--color-brand-glow)',
            }}
          >
            <QrCode
              size={12}
              style={{
                color: isExpired ? 'var(--color-text-muted)' : 'var(--color-brand)',
              }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="text-[11px] font-bold sm:text-xs"
              style={{
                color: isExpired ? 'var(--color-text-muted)' : 'var(--color-brand)',
              }}
            >
              {isExpired ? 'QR Code Expired' : '📱 QR Code — Complete Purchase'}
            </p>
            <p className="text-[9px] sm:text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {isExpired ? 'Ask seller to regenerate' : `Valid until ${expireTime}`}
            </p>
          </div>
        </div>

        {/* Product info + action */}
        <div className="px-3 py-2.5 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p
                className="truncate text-xs font-semibold"
                style={{
                  color: 'var(--color-text-primary)',
                  maxWidth: '140px',
                }}
              >
                {qrData.productTitle}
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>
                {formatPrice(qrData.productPrice, qrData.currency)}
              </p>
            </div>

            {/* Buyer: scan button */}
            {!isMine && !isExpired && (
              <Button
                size="xs"
                leftIcon={<ScanLine size={12} />}
                onClick={() => onScanClick(qrData.token)}
                className="flex-shrink-0"
              >
                <span className="hidden sm:inline">Scan & Confirm</span>
                <span className="sm:hidden">Confirm</span>
              </Button>
            )}

            {/* Seller: sent confirmation */}
            {isMine && (
              <div className="flex-shrink-0 text-right">
                <div
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: 'var(--color-success)' }}
                >
                  <CheckCircle size={11} />
                  <span>Sent</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// QR GENERATOR MODAL (Seller)
// ──────────────────────────────────────────────────────────────
function QRGeneratorModal({ isOpen, onClose, product, buyerId }) {
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState('10:00');
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      QRService.generate({
        product_id: product?.id,
        buyer_id: buyerId,
      }),
    onSuccess: (res) => {
      setQrData(res.data);
      setExpired(false);
      startCountdown(res.data.expires_at);
      toast.success('QR Code sent to buyer in chat!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => QRService.cancel({ product_id: product?.id }),
    onSuccess: () => {
      setQrData(null);
      clearInterval(intervalRef.current);
      toast.success('QR cancelled');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const startCountdown = (expiresAt) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        clearInterval(intervalRef.current);
        setExpired(true);
        setCountdown('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}:${String(s).padStart(2, '0')}`);
    }, 1000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        clearInterval(intervalRef.current);
        setQrData(null);
        onClose();
      }}
      title="Complete the Sale"
      size="sm"
    >
      <div className="mt-4 space-y-4">
        {qrData ? (
          <div className="space-y-4 text-center">
            <div
              className="inline-block rounded-2xl p-3"
              style={{
                backgroundColor: 'white',
                opacity: expired ? 0.4 : 1,
                filter: expired ? 'grayscale(100%)' : 'none',
              }}
            >
              <img src={qrData.qr_code} alt="QR" className="h-48 w-48 sm:h-52 sm:w-52" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock
                size={16}
                style={{
                  color: expired ? 'var(--color-error)' : 'var(--color-success)',
                }}
              />
              <span
                className="font-mono text-xl font-bold"
                style={{
                  color: expired ? 'var(--color-error)' : 'var(--color-text-primary)',
                }}
              >
                {countdown}
              </span>
            </div>

            <div
              className="rounded-xl p-2.5 text-center text-xs"
              style={{
                backgroundColor: 'var(--color-brand-glow)',
                border: '1px solid rgba(91,110,245,0.2)',
                color: 'var(--color-brand-light)',
              }}
            >
              📱 QR code sent to buyer in chat
            </div>

            <div className="flex gap-2">
              {expired ? (
                <Button
                  fullWidth
                  onClick={() => generateMutation.mutate()}
                  isLoading={generateMutation.isPending}
                  leftIcon={<QrCode size={16} />}
                >
                  Regenerate
                </Button>
              ) : (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => cancelMutation.mutate()}
                  isLoading={cancelMutation.isPending}
                >
                  Cancel QR
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              }}
            >
              <QrCode size={28} className="text-white" />
            </div>
            <div>
              <p
                className="font-semibold"
                style={{
                  color: 'var(--color-text-primary)',
                }}
              >
                Ready to finalize?
              </p>
              <p
                className="mt-1 text-sm"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                QR code will be sent to buyer in chat automatically.
              </p>
            </div>
            <Button
              fullWidth
              size="lg"
              isLoading={generateMutation.isPending}
              loadingText="Generating..."
              leftIcon={<QrCode size={18} />}
              onClick={() => generateMutation.mutate()}
            >
              Generate & Send QR
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────
// QR SCANNER MODAL (Buyer)
// ──────────────────────────────────────────────────────────────
function QRScannerModal({ isOpen, onClose, prefillToken, productId, onSuccess }) {
  const [token, setToken] = useState(prefillToken || '');
  const [useCamera, setUseCamera] = useState(false);

  useEffect(() => {
    if (prefillToken) {
      setToken(prefillToken);
      setUseCamera(false);
    }
  }, [prefillToken]);

  const scanMutation = useMutation({
    mutationFn: () => QRService.scan({ product_id: productId, token: token.trim() }),
    onSuccess: (res) => {
      onSuccess(res.data);
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  useEffect(() => {
    if (!useCamera) return;

    const html5QrCode = new Html5Qrcode('chat-qr-reader');
    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        html5QrCode.stop().then(() => {
          setUseCamera(false);
          setToken(decodedText.trim());
        }).catch(console.error);
      },
      (error) => {} // ignore stream errors
    ).catch((err) => {
      console.error(err);
      toast.error('Failed to start camera. Please ensure permissions are granted.');
      setUseCamera(false);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [useCamera]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Purchase" size="sm">
      <div className="mt-4 space-y-4">
        <div
          className="flex flex-col items-center rounded-2xl py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.1), rgba(139,92,246,0.05))',
            border: '1px solid rgba(91,110,245,0.2)',
          }}
        >
          <ScanLine size={40} style={{ color: 'var(--color-brand)' }} />
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            QR Verification
          </p>
          {prefillToken && (
            <p className="mt-1 text-[11px]" style={{ color: 'var(--color-success)' }}>
              ✓ Token loaded from chat
            </p>
          )}
        </div>

        {useCamera ? (
          <div className="overflow-hidden rounded-xl bg-black/5 relative min-h-[300px]">
            <div id="chat-qr-reader" className="w-full [&>div]:border-none [&_video]:object-cover" />
            <button 
              onClick={() => setUseCamera(false)} 
              className="mt-4 mb-2 text-xs text-center w-full hover:underline" 
              style={{ color: 'var(--color-text-muted)' }}
            >
               Cancel Camera
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token auto-fills from chat message..."
              rows={3}
              className="input-base resize-none font-mono text-[10px] sm:text-[11px] w-full"
            />
            {!prefillToken && (
              <Button fullWidth variant="outline" size="sm" onClick={() => setUseCamera(true)}>
                Open Camera to Scan
              </Button>
            )}
          </div>
        )}

        <div
          className="flex items-start gap-2 rounded-xl p-2.5 text-[11px]"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)',
            color: 'var(--color-warning)',
          }}
        >
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>Only confirm from sellers you've met in person.</span>
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!token.trim()}
          isLoading={scanMutation.isPending}
          loadingText="Verifying..."
          leftIcon={<CheckCircle size={18} />}
          onClick={() => scanMutation.mutate()}
        >
          Confirm Purchase
        </Button>
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────
// REVIEW MODAL
// ──────────────────────────────────────────────────────────────
function ReviewModal({ isOpen, onClose, transactionId, reviewerType }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState({});
  const [hovered, setHovered] = useState(0);

  const TAGS =
    reviewerType === 'buyer'
      ? [
          { key: 'tag_friendly', label: '😊 Friendly' },
          { key: 'tag_fast', label: '⚡ Fast' },
          {
            key: 'tag_accurate',
            label: '✅ Accurate Description',
          },
          {
            key: 'tag_great_comm',
            label: '💬 Great Communication',
          },
          {
            key: 'tag_would_buy_again',
            label: '🔄 Would Buy Again',
          },
        ]
      : [
          { key: 'tag_friendly', label: '😊 Friendly' },
          { key: 'tag_fast', label: '⚡ Fast' },
          {
            key: 'tag_great_comm',
            label: '💬 Great Communication',
          },
          {
            key: 'tag_would_sell_again',
            label: '🔄 Would Sell Again',
          },
        ];

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent! ⭐'];

  const mutation = useMutation({
    mutationFn: () =>
      ReviewService.create({
        qr_transaction_id: transactionId,
        rating,
        comment: comment.trim() || undefined,
        ...Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, !!v])),
      }),
    onSuccess: () => {
      toast.success('Review submitted! ⭐');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review" size="sm">
      <div className="mt-4 space-y-5">
        {/* Stars */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                type="button"
                whileTap={{ scale: 0.8 }}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
              >
                <Star
                  size={32}
                  fill={s <= (hovered || rating) ? 'var(--color-warning)' : 'none'}
                  style={{
                    color:
                      s <= (hovered || rating)
                        ? 'var(--color-warning)'
                        : 'var(--color-border-strong)',
                    transition: 'all 0.1s',
                  }}
                />
              </motion.button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
              {LABELS[hovered || rating]}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={() =>
                setTags((p) => ({
                  ...p,
                  [tag.key]: !p[tag.key],
                }))
              }
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: tags[tag.key]
                  ? 'var(--color-brand-glow)'
                  : 'var(--color-surface-elevated)',
                border: `1px solid ${tags[tag.key] ? 'var(--color-brand)' : 'var(--color-border)'}`,
                color: tags[tag.key] ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          maxLength={1000}
          rows={3}
          className="input-base resize-none"
        />

        <Button
          fullWidth
          disabled={rating === 0}
          isLoading={mutation.isPending}
          loadingText="Submitting..."
          onClick={() => mutation.mutate()}
          leftIcon={<Star size={16} />}
        >
          Submit Review
        </Button>

        <button
          onClick={onClose}
          className="w-full text-center text-xs hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip for now
        </button>
      </div>
    </Modal>
  );
}
