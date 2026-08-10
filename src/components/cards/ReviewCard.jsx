import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Avatar from '@components/ui/Avatar';
import { cn } from '@lib/utils';
import { formatRelativeTime } from '@utils/formatters';
import { BUYER_REVIEW_TAGS, SELLER_REVIEW_TAGS } from '@utils/constants';

export default function ReviewCard({ review, showProduct = false }) {
  const reviewer   = review.reviewer;
  const product    = review.products;
  const allTags    = [...BUYER_REVIEW_TAGS, ...SELLER_REVIEW_TAGS];
  const activeTags = allTags.filter((t) => review[t.key]);

  return (
    <motion.div
      className="card p-4 space-y-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Reviewer */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link to={`/user/${reviewer?.username}`}>
            <Avatar src={reviewer?.avatar_url} name={reviewer?.username} size="sm" />
          </Link>
          <div>
            <Link to={`/user/${reviewer?.username}`}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {reviewer?.username}
              </p>
            </Link>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {formatRelativeTime(review.created_at)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              fill={s <= review.rating ? 'var(--color-warning)' : 'none'}
              style={{ color: s <= review.rating ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {review.comment}
        </p>
      )}

      {/* Tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeTags.map((tag) => (
            <span
              key={tag.key}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: 'var(--glass-bg-strong)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Product */}
      {showProduct && product && (
        <Link
          to={`/product/${product.id}`}
          className="flex items-center gap-2 pt-2"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            📦 {product.title}
          </span>
        </Link>
      )}
    </motion.div>
  );
}