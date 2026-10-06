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
 * Get category-appropriate placeholder image URL when listing photos are loading or missing
 */
export function getProductPlaceholderImage(product = {}) {
  const catName = String(product?.category?.name || product?.categories?.name || product?.category_name || '').toLowerCase();
  const catSlug = String(product?.category?.slug || product?.categories?.slug || product?.category_slug || '').toLowerCase();
  const title = String(product?.title || '').toLowerCase();
  const desc = String(product?.description || '').toLowerCase();

  // 1. Automotive & Parts
  if (
    catName.includes('vehicle') || catName.includes('car') || catName.includes('auto') ||
    catSlug.includes('vehicle') || catSlug.includes('car') || catSlug.includes('auto') ||
    /(\b(toyota|honda|ford|bmw|mercedes|audi|tesla|chevrolet|nissan|jeep|sedan|suv|truck|motorcycle|mileage)\b)/i.test(title + ' ' + desc)
  ) {
    if (/(\b(tire|wheel|part|accessory|rack|battery|mat)\b)/i.test(title + ' ' + desc)) {
      return 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80';
    }
    if (/(\b(truck|f-150|silverado|ram)\b)/i.test(title + ' ' + desc)) {
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80';
  }

  // 2. Real Estate
  if (
    catName.includes('real estate') || catName.includes('property') || catSlug.includes('real-estate') ||
    desc.includes('[property_type]') || desc.includes('[intent]') ||
    /(\b(house|home|apartment|condo|townhome|land|rent|bedroom|sqft|acreage)\b)/i.test(title + ' ' + desc)
  ) {
    if (/(\b(apartment|condo|flat|studio)\b)/i.test(title + ' ' + desc)) {
      return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80';
    }
    if (/(\b(commercial|office|retail|warehouse)\b)/i.test(title + ' ' + desc)) {
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80';
  }

  // 3. Phones & Tablets
  if (/(\b(iphone|phone|smartphone|galaxy|pixel|ipad|tablet|smartwatch|airpod)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  }

  // 4. Computers & Laptops
  if (/(\b(macbook|laptop|computer|desktop|pc|monitor|keyboard)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80';
  }

  // 5. Fashion & Shoes
  if (/(\b(shoe|sneaker|nike|adidas|boot|heel|sandal)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
  }
  if (/(\b(shirt|jacket|dress|coat|pants|hoodie|clothing|apparel|watch|bag)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
  }

  // 6. Furniture & Home
  if (/(\b(sofa|couch|table|chair|desk|bed|furniture|lamp|decor)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80';
  }

  // 7. Appliances
  if (/(\b(fridge|refrigerator|washer|dryer|oven|stove|blender|microwave|coffee|vacuum)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80';
  }

  // 8. Tools
  if (/(\b(drill|tool|wrench|saw|generator|compressor|hammer)\b)/i.test(title + ' ' + desc)) {
    return 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&auto=format&fit=crop&q=80';
  }

  // Default clean marketplace product photo
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
}

/**
 * Get primary image from product_images array or product object with fallback
 */
export function getPrimaryImage(images = [], fallbackProduct = null) {
  let url = null;
  if (Array.isArray(images) && images.length > 0) {
    const primary = images.find((img) => img.is_primary);
    url = primary?.cdn_url || primary?.storage_url || images[0]?.cdn_url || images[0]?.storage_url || null;
  } else if (images && typeof images === 'object' && !Array.isArray(images)) {
    if (Array.isArray(images.product_images) && images.product_images.length > 0) {
      const primary = images.product_images.find((img) => img.is_primary);
      url = primary?.cdn_url || primary?.storage_url || images.product_images[0]?.cdn_url || images.product_images[0]?.storage_url || null;
    }
    fallbackProduct = fallbackProduct || images;
  }

  if (url) return url;
  if (fallbackProduct) return getProductPlaceholderImage(fallbackProduct);
  return null;
}

/**
 * Get all image URLs from product_images array
 */
export function getAllImageUrls(images = [], fallbackProduct = null) {
  if (Array.isArray(images) && images.length > 0) {
    const urls = images.map((img) => img.cdn_url || img.storage_url).filter(Boolean);
    if (urls.length > 0) return urls;
  }
  if (fallbackProduct) {
    const ph = getProductPlaceholderImage(fallbackProduct);
    if (ph) return [ph];
  }
  return [];
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
  if (conversation.buyer?.id === userId || conversation.buyer_id === userId) {
    return conversation.seller || (conversation.seller_id ? { id: conversation.seller_id } : null);
  }
  if (conversation.seller?.id === userId || conversation.seller_id === userId) {
    return conversation.buyer || (conversation.buyer_id ? { id: conversation.buyer_id } : null);
  }
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
  if (!file) return { valid: false, error: 'No file selected' };
  const type = (file.type || '').toLowerCase();
  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/pjpeg',
    'image/x-png',
    'image/gif',
    'image/bmp',
    'image/heic',
    'image/heif',
    'image/avif',
  ];
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'avif'];

  const isValidType =
    type.startsWith('image/') ||
    allowedTypes.includes(type) ||
    (ext && allowedExts.includes(ext));

  if (!isValidType) {
    return { valid: false, error: 'Only image files (JPEG, PNG, WebP) are allowed' };
  }
  const MAX_MB = 15;
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

/**
 * Extract QR verification token from raw string, JSON payload, or URL
 */
export function extractQRToken(raw = '') {
  if (!raw) return '';
  let text = String(raw).trim();
  // Strip surrounding quotes
  text = text.replace(/^["']|["']$/g, '');

  // Check if it's a JSON string containing a token
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.token) return String(parsed.token).trim();
    } catch (_e) {
      // not JSON
    }
  }

  // Check if it's a URL or contains token= parameter
  if (text.includes('token=')) {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://${text}`);
      const param = url.searchParams.get('token');
      if (param) return decodeURIComponent(param).trim();
    } catch (_e) {
      const match = text.match(/[?&]token=([^&#]+)/);
      if (match) return decodeURIComponent(match[1]).trim();
    }
  }

  if (text.includes('%')) {
    try {
      text = decodeURIComponent(text);
    } catch (_e) {
      // invalid encoded sequence
    }
  }

  return text.trim();
}