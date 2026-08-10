import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@store/auth.store';
import ProductService from '@api/services/product.service';
import BadgeUI from '@components/ui/Badge';
import { cn, formatPrice, formatRelativeTime, getConditionLabel, getConditionColor } from '@lib/utils';
import { getPrimaryImage } from '@utils/helpers';
import { formatCompactNumber } from '@utils/formatters';
import toast from '@lib/toast';

const ProductCard = memo(function ProductCard({ product, showSeller = true }) {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(product.is_favorited || false);

  const imageUrl = getPrimaryImage(product.product_images);
  const store    = product.stores;
  const seller   = product.users;

  const favMutation = useMutation({
    mutationFn: () =>
      isFav
        ? ProductService.unfavorite(product.id)
        : ProductService.favorite(product.id),
    onMutate: () => setIsFav((prev) => !prev),
    onError:  () => {
      setIsFav((prev) => !prev);
      toast.error('Failed to update favorite');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to save favorites');
      return;
    }
    if (user?.id === product.users?.id) return;
    favMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block card-interactive overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-surface-elevated)' }}
            >
              <span className="text-4xl opacity-30">📦</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
              'backdrop-blur-md border',
              isFav
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-black/20 border-white/10 text-white/80 hover:bg-black/40'
            )}
          >
            <Heart
              size={16}
              fill={isFav ? 'currentColor' : 'none'}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </button>

          {/* Condition badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2 py-0.5 rounded-lg text-[10px] font-semibold backdrop-blur-md',
                getConditionColor(product.condition)
              )}
            >
              {getConditionLabel(product.condition)}
            </span>
          </div>

          {/* Featured badge */}
          {product.is_featured && (
            <div className="absolute bottom-3 left-3">
              <BadgeUI variant="brand" size="xs">⭐ Featured</BadgeUI>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2.5">
          {/* Title */}
          <h3
            className="font-semibold text-sm line-clamp-2 leading-snug"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {product.title}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-gradient-brand">
            {formatPrice(product.price, product.currency)}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {product.location_city && (
                <>
                  <MapPin size={11} />
                  <span className="truncate max-w-[80px]">{product.location_city}</span>
                  <span>·</span>
                </>
              )}
              <span>{formatRelativeTime(product.created_at)}</span>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span className="flex items-center gap-0.5">
                <Eye size={11} />
                {formatCompactNumber(product.view_count)}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart size={11} />
                {formatCompactNumber(product.favorite_count)}
              </span>
            </div>
          </div>

          {/* Seller info */}
          {showSeller && store && (
            <div
              className="flex items-center gap-2 pt-2"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="w-5 h-5 rounded-md object-cover"
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white bg-brand-500"
                >
                  {store.store_name?.[0]}
                </div>
              )}
              <span
                className="text-xs truncate flex-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {store.store_name}
              </span>
              {store.is_verified && (
                <span className="text-[10px]" title="Verified">✅</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;