import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useInterestStore from '@store/interest.store';
import ProductService from '@api/services/product.service';
import BadgeUI from '@components/ui/Badge';
import { cn, formatPrice, formatRelativeTime, getConditionLabel, getConditionColor } from '@lib/utils';
import { getPrimaryImage } from '@utils/helpers';
import { formatCompactNumber } from '@utils/formatters';
import toast from '@lib/toast';
import { parsePropertyDescription } from '@utils/categoryHelpers';
import { CATEGORY_IDS } from '@utils/constants';

const ProductCard = memo(function ProductCard({ product, showSeller = true }) {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(product.is_favorited || false);
  const logView = useInterestStore((s) => s.logView);
  const logFavorite = useInterestStore((s) => s.logFavorite);

  const imageUrl = getPrimaryImage(product.product_images);
  const store    = product.stores;
  const seller   = product.users;

  const favMutation = useMutation({
    mutationFn: () =>
      isFav
        ? ProductService.unfavorite(product.id)
        : ProductService.favorite(product.id),
    onMutate: () => setIsFav((prev) => !prev),
    onSuccess: () => {
      toast.success(isFav ? 'Removed from Favorites' : 'Added to Favorites');
    },
    onError:  () => {
      setIsFav((prev) => !prev);
      toast.error('Failed to update favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites() });
    },
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
    if (!isFav) {
      logFavorite(product.category_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/product/${product.id}`}
        onClick={() => logView(product.category_id)}
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

          {/* Condition badge / Transaction Type badge */}
          <div className="absolute top-3 left-3">
            {product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE ? (
              (() => {
                const attrs = parsePropertyDescription(product.description);
                let badgeText = 'For Sale';
                let badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600';
                if (attrs.intent === 'rent') {
                  badgeText = 'For Rent';
                  badgeColor = 'bg-blue-500/10 border-blue-500/30 text-blue-600';
                } else if (attrs.intent === 'lease') {
                  badgeText = 'For Lease';
                  badgeColor = 'bg-purple-500/10 border-purple-500/30 text-purple-600';
                } else if (attrs.intent === 'vacation') {
                  badgeText = 'Vacation';
                  badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-600';
                }
                return (
                  <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-semibold border backdrop-blur-md', badgeColor)}>
                    {badgeText}
                  </span>
                );
              })()
            ) : (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-semibold backdrop-blur-md',
                  getConditionColor(product.condition)
                )}
              >
                {getConditionLabel(product.condition)}
              </span>
            )}
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

          {/* Price & Real estate subtitle info */}
          <div>
            <p className="text-lg font-bold text-gradient-brand">
              {(() => {
                if (product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE) {
                  const attrs = parsePropertyDescription(product.description);
                  const priceStr = formatPrice(product.price, product.currency);
                  if (attrs.intent === 'rent') return `${priceStr} / mo`;
                  if (attrs.intent === 'vacation') return `${priceStr} / night`;
                  if (attrs.intent === 'lease') {
                    const leaseTypeMatch = product.description.match(/Pricing Type:\s*(\w+)/);
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
            {(product.category_id === CATEGORY_IDS.PROPERTY || product.category_id === CATEGORY_IDS.REAL_ESTATE) && (() => {
              const attrs = parsePropertyDescription(product.description);
              let subtitleParts = [];
              if (attrs.propertyType === 'land') {
                const acMatch = product.description.match(/Acreage:\s*([^\n]+)/);
                if (acMatch) subtitleParts.push(`${acMatch[1]} acres`);
              } else if (['commercial', 'office', 'industrial'].includes(attrs.propertyType) || attrs.intent === 'lease') {
                if (attrs.areaSize) subtitleParts.push(`${attrs.areaSize} sq ft`);
              } else {
                if (attrs.bedrooms) {
                  subtitleParts.push(attrs.bedrooms === 'studio' ? 'Studio' : `${attrs.bedrooms} bd`);
                }
                if (attrs.bathrooms) subtitleParts.push(`${attrs.bathrooms} ba`);
              }
              if (subtitleParts.length > 0) {
                return (
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {subtitleParts.join(' · ')}
                  </p>
                );
              }
              return null;
            })()}
          </div>

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