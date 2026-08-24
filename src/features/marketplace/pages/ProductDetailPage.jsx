import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Flag,
  MessageCircle,
  MapPin,
  Eye,
  Clock,
  ArrowLeft,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ProductService from '@api/services/product.service';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import BadgeUI from '@components/ui/Badge';
import Spinner from '@components/ui/Spinner';
import EmptyState from '@components/common/EmptyState';
import ReportModal from '@components/modals/ReportModal';
import {
  cn,
  formatPrice,
  formatRelativeTime,
  getConditionLabel,
  getConditionColor,
  getErrorMessage,
} from '@lib/utils';
import { formatDate, formatCompactNumber, formatRating } from '@utils/formatters';
import { getPrimaryImage, getAllImageUrls } from '@utils/helpers';
import toast from '@lib/toast';
import { parsePropertyDescription, stripPrivateTags } from '@utils/categoryHelpers';
import { CATEGORY_IDS } from '@utils/constants';

const STARTER_MESSAGES = [
  'Hi! Is this still available?',
  'Hello, I am interested in this item. Can we discuss?',
  'Hey! What is the lowest price you would accept?',
  'Hi there! Can I come see this in person?',
  'Hello! Is the price negotiable?',
  'Hey, can you tell me more about the condition?',
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [activeImage, setActiveImage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');

  // ── Fetch product ──────────────────────────────────────
  const {
    data: productData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.byId(id),
    queryFn: () => ProductService.getById(id),
    enabled: !!id,
  });

  const product = productData?.data;

  // ── Favorite toggle ────────────────────────────────────
  const [isFav, setIsFav] = useState(false);

  const favMutation = useMutation({
    mutationFn: () => (isFav ? ProductService.unfavorite(id) : ProductService.favorite(id)),
    onMutate: () => setIsFav((p) => !p),
    onError: () => {
      setIsFav((p) => !p);
      toast.error('Failed to update favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.byId(id),
      });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites() });
    },
  });

  // Set initial fav state
  if (
    product &&
    product.is_favorited !== undefined &&
    product.is_favorited !== isFav &&
    !favMutation.isPending
  ) {
    setIsFav(product.is_favorited);
  }

  // ── Start conversation mutation ────────────────────────
  const startChatMutation = useMutation({
    mutationFn: (data) => ChatService.createConversation(data),
    onSuccess: (response) => {
      const conv = response.data;
      setShowMessageModal(false);
      setSelectedMessage('');
      // ✅ Navigate directly to conversation — NOT /inbox?product=id
      navigate(`/inbox/${conv.id}`);
      toast.success('Conversation started!');
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      if (msg.includes('own product')) {
        toast.error('You cannot message yourself about your own listing');
      } else {
        toast.error(msg);
      }
    },
  });

  // ── Loading ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="container-app py-12">
        <EmptyState
          icon="😕"
          title="Product not found"
          description="This product may have been removed or is no longer available."
          actionLabel="Browse Marketplace"
          actionTo="/marketplace"
        />
      </div>
    );
  }

  const images = getAllImageUrls(product.product_images);
  const store = product.stores;
  const seller = product.users;
  const isOwner = user?.id === seller?.id;
  const isAvailable = product.status === 'available';

  // ── Share handler ──────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Aliwayz`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.title} — Aliwayz</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
      </Helmet>

      <div className="container-app py-4 pb-24 sm:py-8 md:pb-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm transition-colors hover:underline"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* ═══ LEFT: Images ═════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Main image */}
            <div
              className="relative aspect-square overflow-hidden rounded-2xl"
              style={{
                backgroundColor: 'var(--color-surface)',
              }}
            >
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-6xl opacity-20">📦</span>
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl backdrop-blur-md"
                    style={{
                      backgroundColor: 'var(--glass-bg-strong)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl backdrop-blur-md"
                    style={{
                      backgroundColor: 'var(--glass-bg-strong)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--glass-bg-strong)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200"
                    style={{
                      borderColor: activeImage === i ? 'var(--color-brand)' : 'var(--color-border)',
                      opacity: activeImage === i ? 1 : 0.6,
                    }}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ═══ RIGHT: Product Info ══════════════════════ */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
            }}
          >
            {/* Status + Condition */}
            <div className="flex flex-wrap items-center gap-2">
              <BadgeUI variant={product.status === 'available' ? 'success' : 'warning'} dot>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </BadgeUI>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getConditionColor(product.condition)
                )}
              >
                {getConditionLabel(product.condition)}
              </span>
              {product.is_featured && <BadgeUI variant="brand">⭐ Featured</BadgeUI>}
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-bold leading-tight sm:text-3xl"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <p className="text-gradient-brand text-3xl font-bold sm:text-4xl">
              {(() => {
                if (product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE) {
                  const attrs = parsePropertyDescription(product.description || '');
                  const priceStr = formatPrice(product.price, product.currency);
                  if (attrs.intent === 'rent') return `${priceStr} / mo`;
                  if (attrs.intent === 'vacation') return `${priceStr} / night`;
                  if (attrs.intent === 'lease') {
                    const leaseTypeMatch = (product.description || '').match(/Pricing Type:\s*(\w+)/);
                    const leaseType = leaseTypeMatch ? leaseTypeMatch[1] : '';
                    if (leaseType === 'year') return `${priceStr} / yr`;
                    if (leaseType === 'sqft_month') return `${priceStr} / SF / mo`;
                    if (leaseType === 'sqft_year') return `${priceStr} / SF / yr`;
                    return `${priceStr} / mo`;
                  }
                  return priceStr;
                }
                return formatPrice(product.price, product.currency);
              })()}
            </p>

            {/* Meta */}
            <div
              className="flex flex-wrap items-center gap-4 text-sm"
              style={{
                color: 'var(--color-text-muted)',
              }}
            >
              {product.location_city && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {product.location_city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatRelativeTime(product.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {formatCompactNumber(product.view_count)} views
              </span>
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {formatCompactNumber(product.favorite_count)}
              </span>
            </div>

            {/* ── Action Buttons ──────────────────────────── */}
            {!isOwner && (
              <div className="flex gap-3">
                {isAvailable && (
                  <Button
                    size="lg"
                    fullWidth
                    leftIcon={<MessageCircle size={18} />}
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      setShowMessageModal(true);
                    }}
                  >
                    Message Seller
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Sign in to save favorites');
                      return;
                    }
                    favMutation.mutate();
                  }}
                  className={isFav ? '!border-red-400/30 !text-red-400' : ''}
                >
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </Button>

                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 size={18} />
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="flex gap-3">
                <Button fullWidth variant="secondary" onClick={() => navigate(`/sell/edit/${id}`)}>
                  Edit Listing
                </Button>
              </div>
            )}

            {/* ── Description ────────────────────────────── */}
            {product.description && (
              <div className="space-y-2">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Description
                </h3>
                <p
                  className="whitespace-pre-line text-sm leading-relaxed"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE
                    ? stripPrivateTags(product.description)
                    : product.description}
                </p>
              </div>
            )}

            {/* ── Private Real Estate Info (Seller Only) ──── */}
            {isOwner && (product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE) && (() => {
              const attrs = parsePropertyDescription(product.description);
              if (attrs.address) {
                return (
                  <div
                    className="space-y-2 rounded-2xl p-4 border"
                    style={{
                      backgroundColor: 'rgba(16,185,129,0.05)',
                      borderColor: 'rgba(16,185,129,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <MapPin size={14} />
                      <span>Private Property Details (Seller Only)</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p style={{ color: 'var(--color-text-primary)' }}>
                        <span className="font-semibold">Private Address:</span> {attrs.address}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)' }}>
                        <span className="font-semibold">Public Representation:</span> {attrs.addressVisibility === 'exact' ? 'Exact location' : 'Approximate neighborhood circle'}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* ── Details ────────────────────────────────── */}
            <div
              className="space-y-3 rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-sm font-semibold"
                style={{
                  color: 'var(--color-text-primary)',
                }}
              >
                Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  {
                    label: 'Condition',
                    value: getConditionLabel(product.condition),
                  },
                  {
                    label: 'Brand',
                    value: product.brand || 'Not specified',
                  },
                  {
                    label: 'Color',
                    value: product.color || 'Not specified',
                  },
                  {
                    label: 'Quantity',
                    value: product.quantity,
                  },
                  {
                    label: 'Category',
                    value: product.categories?.name,
                  },
                  {
                    label: 'Listed',
                    value: formatDate(product.created_at),
                  },
                ]
                  .filter((d) => d.value)
                  .map((detail) => (
                    <div key={detail.label}>
                      <p
                        className="text-xs"
                        style={{
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {detail.label}
                      </p>
                      <p
                        className="font-medium"
                        style={{
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {detail.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* ── Seller Card ────────────────────────────── */}
            {store && (
              <Link
                to={`/store/${store.slug}`}
                className="glass-card block p-4 transition-all duration-200 hover:border-[var(--color-brand)]"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={store.logo_url} name={store.store_name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className="truncate text-sm font-semibold"
                        style={{
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {store.store_name}
                      </h4>
                      {store.is_verified && (
                        <ShieldCheck
                          size={14}
                          style={{
                            color: 'var(--color-info)',
                          }}
                        />
                      )}
                    </div>
                    <div
                      className="mt-1 flex items-center gap-3 text-xs"
                      style={{
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {(store.average_rating > 0 && store.total_reviews > 0) ||
                      (seller?.seller_stats?.average_rating > 0 && seller?.seller_stats?.total_reviews > 0) ? (
                        <span className="flex items-center gap-0.5">
                          <Star
                            size={11}
                            fill="var(--color-warning)"
                            style={{ color: 'var(--color-warning)' }}
                          />
                          {formatRating(
                            store.average_rating > 0
                              ? store.average_rating
                              : seller.seller_stats.average_rating
                          )}
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: 'rgba(91,110,245,0.1)',
                            color: 'var(--color-brand)',
                          }}
                        >
                          🌱 New Seller
                        </span>
                      )}
                      {seller?.location_city && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={11} />
                          {seller.location_city}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{
                      color: 'var(--color-text-muted)',
                    }}
                  />
                </div>
              </Link>
            )}

            {/* ── Report ─────────────────────────────────── */}
            {!isOwner && isAuthenticated && (
              <button
                className="flex items-center gap-1 text-xs transition-colors hover:underline"
                style={{
                  color: 'var(--color-text-muted)',
                }}
                onClick={() => setShowReport(true)}
              >
                <Flag size={12} />
                Report this listing
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══ REPORT MODAL ═════════════════════════════════ */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetType="product"
        targetId={product?.id}
        targetName={product?.title}
      />

      {/* ═══ MESSAGE SELLER MODAL ═════════════════════════ */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMessageModal(false);
                setSelectedMessage('');
              }}
            />

            {/* Modal */}
            <motion.div
              className="relative max-h-[85vh] w-full overflow-hidden overflow-y-auto rounded-t-3xl sm:max-w-md sm:rounded-2xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xl)',
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
            >
              {/* Mobile drag handle */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div
                  className="h-1 w-10 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-border-strong)',
                  }}
                />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {/* Header */}
                <div className="text-center">
                  <div
                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: 'var(--color-brand-glow)',
                    }}
                  >
                    <MessageCircle
                      size={24}
                      style={{
                        color: 'var(--color-brand)',
                      }}
                    />
                  </div>
                  <h3
                    className="text-lg font-bold"
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Message Seller
                  </h3>
                  <p
                    className="mx-auto mt-1 max-w-[280px] truncate text-xs"
                    style={{
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    About: {product?.title}
                  </p>
                </div>

                {/* Product preview */}
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      <span className="text-lg opacity-40">📦</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {product?.title}
                    </p>
                    <p className="text-gradient-brand text-sm font-bold">
                      {formatPrice(product?.price, product?.currency)}
                    </p>
                  </div>
                </div>

                {/* Quick messages */}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium"
                    style={{
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Pick a message
                  </label>
                  <div className="max-h-[180px] space-y-1.5 overflow-y-auto">
                    {STARTER_MESSAGES.map((msg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedMessage(msg)}
                        className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedMessage === msg
                              ? 'var(--color-brand-glow)'
                              : 'var(--color-surface-elevated)',
                          border: `1px solid ${
                            selectedMessage === msg ? 'var(--color-brand)' : 'var(--color-border)'
                          }`,
                          color:
                            selectedMessage === msg
                              ? 'var(--color-brand-light)'
                              : 'var(--color-text-secondary)',
                        }}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom message */}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium"
                    style={{
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Or write your own
                  </label>
                  <textarea
                    value={selectedMessage}
                    onChange={(e) => setSelectedMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    maxLength={2000}
                    className="input-base resize-none"
                  />
                  {selectedMessage && (
                    <p
                      className="text-right text-[11px]"
                      style={{
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {selectedMessage.length}
                      /2000
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowMessageModal(false);
                      setSelectedMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    disabled={!selectedMessage.trim()}
                    isLoading={startChatMutation.isPending}
                    loadingText="Sending..."
                    leftIcon={<MessageCircle size={16} />}
                    onClick={() => {
                      if (!selectedMessage.trim()) return;
                      startChatMutation.mutate({
                        product_id: id,
                        initial_message: selectedMessage.trim(),
                      });
                    }}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
