import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import useInterestStore from '@store/interest.store';
import BadgeUI from '@components/ui/Badge';
import { cn, formatPrice, formatRelativeTime } from '@lib/utils';
import { getPrimaryImage, getProductPlaceholderImage } from '@utils/helpers';
import { formatCompactNumber } from '@utils/formatters';
import toast from '@lib/toast';
import { parsePropertyDescription, getProductUrl } from '@utils/categoryHelpers';
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
    catName.includes('housing') ||
    catName.includes('rent') ||
    catName.includes('apartment') ||
    catSlug.includes('real-estate') ||
    catSlug.includes('property') ||
    catSlug.includes('housing') ||
    catSlug.includes('rent') ||
    catSlug.includes('apartment') ||
    desc.includes('[Property_Type]') ||
    desc.includes('[Intent]') ||
    desc.includes('Listing: For Rent') ||
    desc.includes('Listing: For Lease') ||
    desc.includes('Listing: Vacation') ||
    desc.includes('[Private_Address]') ||
    /Beds?:\s*[^\n]+/i.test(desc) ||
    /Bathrooms?:\s*[^\n]+/i.test(desc) ||
    /Property Type:\s*[^\n]+/i.test(desc) ||
    /(\b(apartment|condo|condominium|villa|house|townhouse|penthouse|studio|office space|commercial space|for rent|for sale|for lease)\b)/i.test(title);



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

  // ── Price Formatter ───────────────────────────────────────────
  const formattedPrice = (() => {
    const basePrice = formatPrice(product.price, product.currency);
    if (isRealEstate) {
      const attrs = parsePropertyDescription(product.description);
      const intentStr = (attrs.intent || '').toLowerCase();
      const descLower = (product.description || '').toLowerCase();
      const titleLower = (product.title || '').toLowerCase();

      if (
        intentStr.includes('rent') ||
        descLower.includes('for rent') ||
        titleLower.includes('for rent') ||
        descLower.includes('listing: for rent')
      ) {
        return `${basePrice} / mo`;
      }
      if (intentStr === 'vacation') return `${basePrice} / night`;
      if (intentStr === 'lease' || descLower.includes('for lease')) {
        const leaseTypeMatch = product.description?.match(/Pricing Type:\s*(\w+)/);
        const leaseType = leaseTypeMatch ? leaseTypeMatch[1] : '';
        if (leaseType === 'year') return `${basePrice} / yr`;
        if (leaseType === 'sqft_month') return `${basePrice} / SF / mo`;
        if (leaseType === 'sqft_year') return `${basePrice} / SF / yr`;
        return `${basePrice} / mo`;
      }
    }
    return basePrice;
  })();

  // ── Real Estate Attributes (bd / ba / sq ft) ──────────────────
  const realEstateSubtitle = (() => {
    if (!isRealEstate) return '';
    const attrs = parsePropertyDescription(product.description);
    const subtitleParts = [];
    if (attrs.propertyType === 'land') {
      const acMatch = product.description?.match(/Acreage:\s*([^\n]+)/i);
      if (acMatch) subtitleParts.push(`${acMatch[1]} acres`);
    } else if (
      ['commercial', 'office', 'industrial'].includes(attrs.propertyType) ||
      attrs.intent === 'lease'
    ) {
      if (attrs.areaSize) {
        const cleanArea = String(attrs.areaSize).replace(/\s*(sqft|sq\s*ft|sq\.?\s*ft\.?)/gi, '').trim();
        subtitleParts.push(`${cleanArea} sq ft`);
      }
    } else {
      if (attrs.bedrooms) {
        subtitleParts.push(attrs.bedrooms === 'studio' ? 'Studio' : `${attrs.bedrooms} bd`);
      }
      if (attrs.bathrooms) subtitleParts.push(`${attrs.bathrooms} ba`);
      if (attrs.areaSize) {
        const cleanArea = String(attrs.areaSize).replace(/\s*(sqft|sq\s*ft|sq\.?\s*ft\.?)/gi, '').trim();
        subtitleParts.push(`${cleanArea} sq ft`);
      }
    }
    return subtitleParts.join(' · ');
  })();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={getProductUrl(product)}
        onClick={() => logView(product.category_id)}
        className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-500/40 hover:shadow-card-hover transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-surface-hover flex-shrink-0">
          <img
            src={imageUrl || getProductPlaceholderImage(product)}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const fallback = getProductPlaceholderImage(product);
              if (e.target.src !== fallback) {
                e.target.src = fallback;
              }
            }}
          />

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={isPending}
            className={cn(
              'absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20 flex-shrink-0 shadow-md',
              'backdrop-blur-md border',
              isFav
                ? 'bg-red-500/25 border-red-500/40 text-red-400 scale-105'
                : 'bg-black/40 border-white/20 text-white/90 hover:bg-black/60 hover:scale-110',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={14}
              fill={isFav ? 'currentColor' : 'none'}
              className="transition-transform duration-200"
            />
          </button>



          {/* Featured badge */}
          {product.is_featured && (
            <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5">
              <BadgeUI variant="brand" size="xs">⭐ Featured</BadgeUI>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
          {/* Main Details (Title, Price, Location, Stats) */}
          <div className="space-y-1.5">
            {/* Title */}
            <h3
              className="font-semibold text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 leading-snug text-[var(--color-text-primary)] group-hover:text-brand-400 transition-colors"
              title={product.title}
            >
              {product.title}
            </h3>

            {/* Price & Real Estate Subtitle */}
            <div className="flex items-baseline justify-between gap-1.5 pt-0.5">
              <p className="text-base sm:text-lg font-bold text-gradient-brand leading-none">
                {formattedPrice}
              </p>
              {realEstateSubtitle && (
                <span
                  className="text-[10px] sm:text-[11px] font-medium truncate max-w-[50%]"
                  style={{ color: 'var(--color-text-muted)' }}
                  title={realEstateSubtitle}
                >
                  {realEstateSubtitle}
                </span>
              )}
            </div>

            {/* Meta row: Location, Date & Stats */}
            <div
              className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <div className="flex items-center gap-1 min-w-0 flex-1 mr-1">
                {product.location_city && (
                  <>
                    <MapPin size={10} className="flex-shrink-0 opacity-70" />
                    <span className="truncate max-w-[70px] sm:max-w-[90px]">{product.location_city}</span>
                    <span className="flex-shrink-0 opacity-40">·</span>
                  </>
                )}
                <span className="truncate flex-shrink-0">{formatRelativeTime(product.created_at)}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="flex items-center gap-0.5" title="Views">
                  <Eye size={10} className="opacity-70" />
                  {formatCompactNumber(product.view_count)}
                </span>
                <span className="flex items-center gap-0.5" title="Favorites">
                  <Heart size={10} className="opacity-70" />
                  {formatCompactNumber(product.favorite_count)}
                </span>
              </div>
            </div>
          </div>

          {/* Seller / Store info */}
          {showSeller && (store || seller) && (
            <div
              className="flex items-center gap-1.5 pt-2 border-t border-[var(--color-border-subtle)]"
            >
              {store ? (
                <>
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.store_name}
                      className="w-4 h-4 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-brand-500 flex-shrink-0">
                      {store.store_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span
                    className="text-[10px] sm:text-[11px] truncate flex-1 font-medium group-hover:text-[var(--color-text-primary)] transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {store.store_name}
                  </span>
                  {store.is_verified && (
                    <span className="text-[9px] flex-shrink-0" title="Verified">✅</span>
                  )}
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-slate-600 flex-shrink-0">
                    {seller?.username?.[0]?.toUpperCase()}
                  </div>
                  <span
                    className="text-[10px] sm:text-[11px] truncate flex-1 font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    @{seller?.username}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;