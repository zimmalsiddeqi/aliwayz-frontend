/**
 * Generate avatar color from string (deterministic)
 */
export function generateAvatarColor(str = '') {
  const colors = [
    'bg-brand-500',
    'bg-accent-purple',
    'bg-accent-cyan',
    'bg-accent-green',
    'bg-accent-orange',
    'bg-accent-pink',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get primary image from product_images array
 */
export function getPrimaryImage(images = []) {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary?.cdn_url || primary?.storage_url || images[0]?.cdn_url || images[0]?.storage_url || null;
}

/**
 * Get all image URLs from product_images array
 */
export function getAllImageUrls(images = []) {
  return images.map((img) => img.cdn_url || img.storage_url).filter(Boolean);
}

/**
 * Check if product is available for purchase
 */
export function isProductAvailable(product) {
  return product?.status === 'available' && !product?.is_deleted;
}

/**
 * Check if product is favorited
 */
export function checkIsFavorited(productId, favorites = []) {
  return favorites.some((f) => f.product?.id === productId || f.product_id === productId);
}

/**
 * Get unread count for a conversation
 */
export function getUnreadCount(conversation, userId) {
  if (!conversation || !userId) return 0;
  if (conversation.buyer_id === userId)  return conversation.buyer_unread_count  || 0;
  if (conversation.seller_id === userId) return conversation.seller_unread_count || 0;
  return 0;
}

/**
 * Get the other participant in a conversation
 */
export function getOtherParticipant(conversation, userId) {
  if (!conversation || !userId) return null;
  if (conversation.buyer?.id === userId)  return conversation.seller;
  if (conversation.seller?.id === userId) return conversation.buyer;
  return null;
}

/**
 * Build pagination info string
 */
export function buildPaginationInfo(pagination) {
  if (!pagination) return '';
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end   = Math.min(pagination.page * pagination.limit, pagination.total);
  return `${start}–${end} of ${pagination.total}`;
}

/**
 * Extract validation errors from API response
 * Matches backend ValidationError format
 */
export function extractApiErrors(error) {
  const errors = {};
  const apiErrors = error?.response?.data?.errors;

  if (Array.isArray(apiErrors)) {
    apiErrors.forEach(({ field, message }) => {
      if (field) errors[field] = message;
    });
  }

  return errors;
}

/**
 * Set form errors from API response
 * Works with React Hook Form setError
 */
export function setFormErrors(error, setError) {
  const errors = extractApiErrors(error);
  Object.entries(errors).forEach(([field, message]) => {
    setError(field, { type: 'server', message });
  });
}

/**
 * Generate temp ID for optimistic updates
 */
export function generateTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get badge display info
 */
export function getBadgeDisplay(code) {
  const badges = {
    new_seller:      { label: 'New Seller',      color: 'bg-slate-500/20 text-slate-300',         emoji: '🌱' },
    verified_seller: { label: 'Verified Seller',  color: 'bg-accent-cyan/20 text-accent-cyan',     emoji: '✅' },
    '100_rated':     { label: '100 Rated',        color: 'bg-brand-500/20 text-brand-400',         emoji: '⭐' },
    '500_rated':     { label: '500 Rated',        color: 'bg-accent-purple/20 text-accent-purple', emoji: '🌟' },
    top_seller:      { label: 'Top Seller',       color: 'bg-accent-orange/20 text-accent-orange', emoji: '🏆' },
    trusted_buyer:   { label: 'Trusted Buyer',    color: 'bg-accent-green/20 text-accent-green',   emoji: '💎' },
  };
  return badges[code] || { label: code, color: 'bg-slate-500/20 text-slate-300', emoji: '🏅' };
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file) {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_MB  = 10;

  if (!ALLOWED.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images allowed' };
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be under ${MAX_MB}MB` };
  }
  return { valid: true, error: null };
}

/**
 * Validate video file before upload
 */
export function validateVideoFile(file) {
  const ALLOWED = ['video/mp4', 'video/quicktime'];
  const MAX_MB  = 100;

  if (!ALLOWED.includes(file.type)) {
    return { valid: false, error: 'Only MP4 and MOV videos allowed' };
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return { valid: false, error: `Video must be under ${MAX_MB}MB` };
  }
  return { valid: true, error: null };
}

/**
 * Create URL for file preview
 */
export function createFilePreview(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL to free memory
 */
export function revokeFilePreview(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

/**
 * Compute listing location based on Quick List vs Permanent Store rules.
 * Quick List: Approximate location (randomized within a 10-mile radius of the user's current GPS location)
 * Permanent Store: Exact store location coordinates (fall back to user current location if store coordinates aren't set)
 */
export function getProductListingLocation({ store, userLat, userLng }) {
  const isQuickList = store?.description === 'Personal listings';

  if (isQuickList) {
    if (!userLat || !userLng) {
      return {
        lat: undefined,
        lng: undefined,
        isApproximate: true,
      };
    }

    // Offset coordinates randomly within a 10-mile radius (approx 0.145 degrees)
    const r = 10 / 69.172; 
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    
    // Adjust x-coordinate for latitude skew
    const xp = x / Math.cos((userLat * Math.PI) / 180);

    return {
      lat: userLat + y,
      lng: userLng + xp,
      isApproximate: true,
    };
  }

  // Permanent store: use shop exact location
  return {
    lat: store?.location_lat ?? userLat ?? undefined,
    lng: store?.location_lng ?? userLng ?? undefined,
    isApproximate: false,
  };
}