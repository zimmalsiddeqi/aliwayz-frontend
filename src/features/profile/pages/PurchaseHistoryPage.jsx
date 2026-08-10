import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, Package, ChevronDown, Eye } from 'lucide-react';
import { useState } from 'react';
import UserService from '@api/services/user.service';
import ReviewService from '@api/services/review.service';
import Avatar from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import Modal from '@components/ui/Modal';
import { cn, getErrorMessage } from '@lib/utils';
import { formatPrice, formatDate, formatRelativeTime } from '@utils/formatters';
import { getPrimaryImage } from '@utils/helpers';
import toast from '@lib/toast';

export default function PurchaseHistoryPage() {
  const queryClient = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating]             = useState(0);
  const [comment, setComment]           = useState('');
  const [hoveredStar, setHoveredStar]   = useState(0);
  const [tags, setTags]                 = useState({});

  const {
    data, fetchNextPage, hasNextPage,
    isFetchingNextPage, isLoading,
  } = useInfiniteQuery({
    queryKey: ['purchases'],
    queryFn:  ({ pageParam = 1 }) =>
      UserService.getPurchases({ page: pageParam, limit: 10 }),
    getNextPageParam: (last) =>
      last.pagination?.has_next ? last.pagination.page + 1 : undefined,
  });

  const purchases = data?.pages.flatMap((p) => p.data) || [];
  const total     = data?.pages?.[0]?.pagination?.total || 0;

  const reviewMutation = useMutation({
    mutationFn: () =>
      ReviewService.create({
        qr_transaction_id:    reviewTarget?.id,
        rating,
        comment:              comment.trim() || undefined,
        tag_friendly:         tags.tag_friendly || false,
        tag_fast:             tags.tag_fast || false,
        tag_accurate:         tags.tag_accurate || false,
        tag_great_comm:       tags.tag_great_comm || false,
        tag_would_buy_again:  tags.tag_would_buy_again || false,
        tag_would_sell_again: false,
      }),
    onSuccess: () => {
      toast.success('Review submitted! ⭐');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setReviewTarget(null);
      setRating(0);
      setComment('');
      setTags({});
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const BUYER_TAGS = [
    { key: 'tag_friendly',        label: '😊 Friendly' },
    { key: 'tag_fast',            label: '⚡ Fast' },
    { key: 'tag_accurate',        label: '✅ Accurate Description' },
    { key: 'tag_great_comm',      label: '💬 Great Communication' },
    { key: 'tag_would_buy_again', label: '🔄 Would Buy Again' },
  ];

  return (
    <>
      <Helmet>
        <title>Purchase History — Aliwayz</title>
      </Helmet>

      <div className="container-app py-4 sm:py-6 max-w-2xl pb-24 md:pb-8">
        <PageHeader
          showBack
          title="Purchase History"
          subtitle={`${total} purchase${total !== 1 ? 's' : ''}`}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No purchases yet"
            description="When you buy something through QR verification, it'll show up here."
            actionLabel="Browse Marketplace"
            actionTo="/marketplace"
          />
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase, i) => {
              const product = purchase.products;
              const seller  = purchase.seller;
              const image   = getPrimaryImage(product?.product_images);

              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 hover-lift">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product image */}
                      <Link
                        to={`/product/${product?.id}`}
                        className="flex-shrink-0"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={product?.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                          >
                            <Package size={24} style={{ color: 'var(--color-text-muted)' }} />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product?.id}`}>
                          <h4
                            className="font-semibold text-sm sm:text-base truncate hover:underline"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {product?.title || 'Product'}
                          </h4>
                        </Link>

                        <p className="text-base sm:text-lg font-bold mt-0.5 text-gradient-brand">
                          {formatPrice(product?.price, product?.currency)}
                        </p>

                        {/* Seller info */}
                        {seller && (
                          <Link
                            to={`/user/${seller.username}`}
                            className="flex items-center gap-1.5 mt-1.5"
                          >
                            <Avatar
                              src={seller.avatar_url}
                              name={seller.username}
                              size="xs"
                            />
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              from @{seller.username}
                            </span>
                          </Link>
                        )}

                        {/* Date */}
                        <p
                          className="text-[11px] mt-1"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          Purchased{' '}
                          {formatDate(purchase.scanned_at || purchase.created_at)}
                          {' · '}
                          {formatRelativeTime(purchase.scanned_at || purchase.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            color: 'var(--color-success)',
                          }}
                        >
                          ✅ Bought
                        </span>

                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<Star size={11} />}
                          onClick={() => setReviewTarget(purchase)}
                        >
                          Review
                        </Button>

                        <Link to={`/product/${product?.id}`}>
                          <Button size="xs" variant="ghost">
                            <Eye size={12} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Load more */}
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  isLoading={isFetchingNextPage}
                  loadingText="Loading..."
                  onClick={() => fetchNextPage()}
                  leftIcon={<ChevronDown size={16} />}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={() => {
          setReviewTarget(null);
          setRating(0);
          setComment('');
          setTags({});
        }}
        title="Leave a Review"
        description="How was your buying experience?"
        size="sm"
      >
        <div className="space-y-5 mt-4">
          {/* Stars */}
          <div className="text-center space-y-2">
            <label className="floating-label">Rating *</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    size={34}
                    fill={s <= (hoveredStar || rating) ? 'var(--color-warning)' : 'none'}
                    style={{
                      color: s <= (hoveredStar || rating)
                        ? 'var(--color-warning)'
                        : 'var(--color-border-strong)',
                      transition: 'all 0.1s',
                    }}
                  />
                </motion.button>
              ))}
            </div>
            {(hoveredStar || rating) > 0 && (
              <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent! ⭐'][hoveredStar || rating]}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {BUYER_TAGS.map((tag) => (
              <button
                key={tag.key}
                type="button"
                onClick={() => setTags((p) => ({ ...p, [tag.key]: !p[tag.key] }))}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: tags[tag.key]
                    ? 'var(--color-brand-glow)'
                    : 'var(--color-surface-elevated)',
                  border: `1px solid ${tags[tag.key] ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  color: tags[tag.key]
                    ? 'var(--color-brand-light)'
                    : 'var(--color-text-secondary)',
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
            placeholder="Share your experience..."
            maxLength={1000}
            rows={3}
            className="input-base resize-none"
          />

          <Button
            fullWidth
            disabled={rating === 0}
            isLoading={reviewMutation.isPending}
            loadingText="Submitting..."
            leftIcon={<Star size={16} />}
            onClick={() => reviewMutation.mutate()}
          >
            Submit Review
          </Button>

          <button
            onClick={() => setReviewTarget(null)}
            className="w-full text-xs text-center hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Skip for now
          </button>
        </div>
      </Modal>
    </>
  );
}