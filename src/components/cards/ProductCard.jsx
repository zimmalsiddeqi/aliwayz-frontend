import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Home, Check, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
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
import { useFavoritesStore } from '@store/favorites.store';

const ProductCard = memo(function ProductCard({ product, showSeller = true }) {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const isFav = useFavoritesStore((s) => s.ids.has(product.id));
  const isPending = useFavoritesStore((s) => s.pendingIds.has(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const logView = useInterestStore((s) => s.logView);
  const logFavorite = useInterestStore((s) => s.logFavorite);

  const imageUrl = getPrimaryImage(product.product_images);
  const store    = product.stores;
  const seller   = product.users;

  // Category & Property/Vehicle attributes detection
  const catId = product.category_id || product.category?.id || product.categories?.id;
  const parentId = product.category?.parent_id || product.categories?.parent_id;
  const catName = (product.category?.name || product.categories?.name || product.category_name || '').toLowerCase();
  const catSlug = (product.category?.slug || product.categories?.slug || product.category_slug || '').toLowerCase();
  const desc = product.description || '';
  const title = (product.title || '').toLowerCase();

  const isRealEstate =
    catId === CATEGORY_IDS.PROPERTY ||
    catId === CATEGORY_IDS.REAL_ESTATE ||
    parentId === CATEGORY_IDS.PROPERTY ||
    parentId === CATEGORY_IDS.REAL_ESTATE ||
    catName.includes('real estate') ||
    catName.includes('property') ||
    catSlug.includes('real-estate') ||
    catSlug.includes('property') ||
    desc.includes('[Property_Type]') ||
    desc.includes('[Intent]') ||
    desc.includes('Listing: For Rent') ||
    desc.includes('Listing: For Lease') ||
    /^(apartment|condo|villa|house|townhouse|office space|studio for rent|room for rent)/i.test(title);

  const isAutomotive =
    catId === CATEGORY_IDS.VEHICLES ||
    catId === CATEGORY_IDS.AUTOMOTIVE ||
    parentId === CATEGORY_IDS.VEHICLES ||
    parentId === CATEGORY_IDS.AUTOMOTIVE ||
    catName.includes('vehicle') ||
    catName.includes('car') ||
    catName.includes('auto') ||
    catName.includes('truck') ||
    catName.includes('motorcycle') ||
    catSlug.includes('vehicle') ||
    catSlug.includes('car') ||
    catSlug.includes('auto') ||
    desc.match(/Mileage:\s*[^\n]+/i) ||
    desc.match(/Transmission:\s*[^\n]+/i) ||
    desc.match(/VIN:\s*[^\n]+/i);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (user?.id === product.users?.id) return;
    if (isPending) return;

    try {
      const res = await toggleFavorite(product.id);
      if (res?.action === 'added') {
        toast.success('❤️ Added to Favorites', { duration: 1000, hideProgress: true });
      } else if (res?.action === 'removed') {
        toast.success('💔 Removed from Favorites', { duration: 1000, hideProgress: true });
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.favorites() });
      if (res?.action === 'added') {
        logFavorite(product.category_id);
      }
    } catch (err) {
      toast.error('⚠️ Unable to update favorites');
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link
        to={`/product/${product.id}`}
        onClick={() => logView(product.category_id)}
        className="block bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-500/40 hover:shadow-card-hover transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-surface-hover">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              No Image
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={isPending}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 z-10',
              'backdrop-blur-md border',
              isFav
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-black/20 border-white/10 text-white/80 hover:bg-black/40',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Heart
              size={16}
              fill={isFav ? 'currentColor' : 'none'}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </button>

          {/* Condition badge / Transaction Type badge */}
          <div className="absolute top-3 left-3 z-10">
            {(() => {
              if (isRealEstate) {
                const attrs = parsePropertyDescription(product.description);
                let badgeText = 'For Sale';
                const intentStr = (attrs.intent || '').toLowerCase();
                const descLower = (product.description || '').toLowerCase();
                const titleLower = (product.title || '').toLowerCase();

                if (intentStr.includes('rent') || descLower.includes('for rent') || titleLower.includes('for rent') || descLower.includes('listing: for rent')) {
                  badgeText = 'For Rent';
                } else if (intentStr.includes('lease') || descLower.includes('for lease') || titleLower.includes('for lease') || descLower.includes('listing: for lease')) {
                  badgeText = 'For Lease';
                } else if (intentStr.includes('vacation')) {
                  badgeText = 'Vacation';
                }
                return (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#6366F1] text-white shadow-md backdrop-blur-md">
                    <Home size={12} className="stroke-[2.5]" />
                    {badgeText}
                  </span>
                );
              }

              if (isAutomotive) {
                const mileageMatch = desc.match(/Mileage:\s*([^\n]+)/i) || desc.match(/(\d+[\d,]*\s*k?\s*miles?)/i);
                let mileageStr = '';
                if (mileageMatch) {
                  const rawNum = mileageMatch[1].replace(/\D/g, '');
                  if (rawNum) {
                    const num = Number(rawNum);
                    mileageStr = num >= 1000 ? `${Math.round(num / 1000)}k miles` : `${num} mi`;
                  } else {
                    mileageStr = mileageMatch[1].trim();
                  }
                }
                const isNew = product.condition === 'new' || product.condition === 'brand_new';
                const condLabel = isNew ? 'New' : 'Used';
                const badgeText = mileageStr ? `${condLabel} • ${mileageStr}` : condLabel;
                return (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-black/70 text-white border border-white/20 shadow-md backdrop-blur-md">
                    <CheckSquare size={12} className="stroke-[2.5] text-blue-400" />
                    {badgeText}
                  </span>
                );
              }

              // General Marketplace Item
              const conditionLabel = getConditionLabel(product.condition) || 'Brand New';
              return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#10B981] text-white shadow-md backdrop-blur-md">
                  <Check size={12} className="stroke-[3]" />
                  {conditionLabel}
                </span>
              );
            })()}
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
                if (isRealEstate) {
                  const attrs = parsePropertyDescription(product.description);
                  const priceStr = formatPrice(product.price, product.currency);
                  const intentStr = (attrs.intent || '').toLowerCase();
                  const descLower = (product.description || '').toLowerCase();
                  const titleLower = (product.title || '').toLowerCase();

                  if (intentStr.includes('rent') || descLower.includes('for rent') || titleLower.includes('for rent') || descLower.includes('listing: for rent')) {
                    return `${priceStr} / mo`;
                  }
                  if (intentStr === 'vacation') return `${priceStr} / night`;
                  if (intentStr === 'lease' || descLower.includes('for lease')) {
                    const leaseTypeMatch = product.description?.match(/Pricing Type:\s*(\w+)/);
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
            {isRealEstate && (() => {
              const attrs = parsePropertyDescription(product.description);
              let subtitleParts = [];
              if (attrs.propertyType === 'land') {
                const acMatch = product.description?.match(/Acreage:\s*([^\n]+)/);
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