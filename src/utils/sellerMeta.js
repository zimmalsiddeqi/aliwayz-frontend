import { CATEGORY_IDS } from '@utils/constants';

export const BUSINESS_TYPES = [
  {
    value: 'marketplace',
    label: 'Marketplace & Goods',
    desc: 'Retail, electronics, home & everyday items',
    categoryId: CATEGORY_IDS.OTHER,
    icon: '🛍️',
    defaultStorefront: true,
  },
  {
    value: 'automotive',
    label: 'Automotive',
    desc: 'Cars, trucks, dealerships & auto parts',
    categoryId: CATEGORY_IDS.AUTOMOTIVE,
    icon: '🚗',
    defaultStorefront: true,
  },
  {
    value: 'real_estate',
    label: 'Real Estate',
    desc: 'Properties, rentals, brokerages & land',
    categoryId: CATEGORY_IDS.PROPERTY,
    icon: '🏠',
    defaultStorefront: true,
  },
];

const LEGACY_BUSINESS_LABELS = {
  marketplace: 'Marketplace & Goods',
  automotive: 'Automotive',
  real_estate: 'Real Estate',
  car_dealership: 'Automotive',
  auto_parts: 'Automotive',
  real_estate_agency: 'Real Estate',
  property_management: 'Real Estate',
  retail_store: 'Marketplace & Goods',
  electronics_shop: 'Marketplace & Goods',
  furniture_home: 'Marketplace & Goods',
  online_store: 'Marketplace & Goods',
  home_business: 'Marketplace & Goods',
  other_business: 'Marketplace & Goods',
};

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Monday',    short: 'Mon' },
  { key: 'tue', label: 'Tuesday',   short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday',  short: 'Thu' },
  { key: 'fri', label: 'Friday',    short: 'Fri' },
  { key: 'sat', label: 'Saturday',  short: 'Sat' },
  { key: 'sun', label: 'Sunday',    short: 'Sun' },
];

export const DEFAULT_BUSINESS_HOURS = {
  mon: { open: '09:00', close: '18:00', closed: false },
  tue: { open: '09:00', close: '18:00', closed: false },
  wed: { open: '09:00', close: '18:00', closed: false },
  thu: { open: '09:00', close: '18:00', closed: false },
  fri: { open: '09:00', close: '18:00', closed: false },
  sat: { open: '10:00', close: '16:00', closed: false },
  sun: { open: '09:00', close: '17:00', closed: true },
};

export const TIME_OPTIONS = [
  { value: '06:00', label: '6:00 AM' },
  { value: '06:30', label: '6:30 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '07:30', label: '7:30 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '23:00', label: '11:00 PM' },
];

export function formatTime24To12(time24) {
  if (!time24) return '';
  const found = TIME_OPTIONS.find((t) => t.value === time24);
  if (found) return found.label;
  const [hStr, mStr] = String(time24).split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr || '00'} ${period}`;
}

export function getBusinessTypeLabel(value) {
  if (!value) return '';
  return (
    BUSINESS_TYPES.find((b) => b.value === value)?.label ||
    LEGACY_BUSINESS_LABELS[value] ||
    value
  );
}

/**
 * Compress businessHours object into compact form for [Seller_Meta] storage
 */
function compressHours(hours) {
  if (!hours || typeof hours !== 'object') return undefined;
  const out = {};
  for (const d of DAYS_OF_WEEK) {
    const dayObj = hours[d.key];
    if (!dayObj) continue;
    if (dayObj.closed) {
      out[d.key] = 'c';
    } else {
      out[d.key] = `${dayObj.open || '09:00'}-${dayObj.close || '18:00'}`;
    }
  }
  return out;
}

/**
 * Expand compact or full businessHours into normalized 7-day structure
 */
export function normalizeBusinessHours(raw) {
  const result = {};
  for (const d of DAYS_OF_WEEK) {
    const def = DEFAULT_BUSINESS_HOURS[d.key];
    const val = raw?.[d.key];
    if (!val) {
      result[d.key] = { ...def };
    } else if (typeof val === 'string') {
      if (val === 'c' || val === 'closed') {
        result[d.key] = { open: def.open, close: def.close, closed: true };
      } else {
        const [open, close] = val.split('-');
        result[d.key] = {
          open: open || def.open,
          close: close || def.close,
          closed: false,
        };
      }
    } else if (typeof val === 'object') {
      result[d.key] = {
        open: val.open || def.open,
        close: val.close || def.close,
        closed: Boolean(val.closed),
      };
    } else {
      result[d.key] = { ...def };
    }
  }
  return result;
}

/**
 * Strip [Seller_Meta] tag from a store description string
 */
export function stripStoreMetaTag(description = '') {
  if (!description) return '';
  return String(description)
    .replace(/\n?\[Seller_Meta\]:[^\n]*/gi, '')
    .trim();
}

/**
 * Encode clean description + structured seller metadata into description string
 * (staying well within the 1000-character limit of stores.description)
 */
export function encodeStoreDescription(cleanDescription = '', meta = {}) {
  const clean = stripStoreMetaTag(cleanDescription);
  const compactMeta = {
    st: meta.sellerType || 'business',
    bt: meta.businessType || undefined,
    hs: meta.hasStorefront !== undefined ? Boolean(meta.hasStorefront) : undefined,
    sa: meta.streetAddress ? String(meta.streetAddress).trim() : undefined,
    av: meta.addressVisibility || undefined,
    be: meta.businessEmail ? String(meta.businessEmail).trim() : undefined,
    bp: meta.businessPhone ? String(meta.businessPhone).trim() : undefined,
    ws: meta.websiteUrl ? String(meta.websiteUrl).trim() : undefined,
    bh: meta.businessHours ? compressHours(meta.businessHours) : undefined,
  };

  // Remove undefined keys
  Object.keys(compactMeta).forEach((k) => {
    if (compactMeta[k] === undefined || compactMeta[k] === '') {
      delete compactMeta[k];
    }
  });

  const metaTag = `[Seller_Meta]:${JSON.stringify(compactMeta)}`;
  const maxCleanLen = Math.max(100, 980 - metaTag.length);
  const safeClean = clean.slice(0, maxCleanLen);

  return safeClean ? `${safeClean}\n${metaTag}` : metaTag;
}

/**
 * Parse store record and extract seller onboarding metadata + clean description
 */
export function parseStoreMeta(store) {
  if (!store) {
    return {
      sellerType: null,
      isQuickProfile: false,
      isPersonalProfile: false,
      isBusinessProfile: false,
      businessType: '',
      businessTypeLabel: '',
      hasStorefront: false,
      streetAddress: '',
      addressVisibility: 'approximate',
      businessEmail: '',
      businessPhone: '',
      websiteUrl: '',
      businessHours: normalizeBusinessHours(DEFAULT_BUSINESS_HOURS),
      cleanDescription: '',
    };
  }

  const rawDesc = store.description || '';
  const cleanDescription = stripStoreMetaTag(rawDesc);

  let parsedTag = {};
  const match = rawDesc.match(/\[Seller_Meta\]:(\{[^\n]*\})/i);
  if (match && match[1]) {
    try {
      parsedTag = JSON.parse(match[1]);
    } catch (_e) {
      parsedTag = {};
    }
  }

  // Determine sellerType: check native column -> parsedTag -> heuristics for legacy stores
  let sellerType = store.seller_type || parsedTag.st || null;
  if (!sellerType) {
    if (cleanDescription === 'Personal listings') {
      sellerType = 'quick';
    } else if (cleanDescription === 'Personal seller profile') {
      sellerType = 'personal';
    } else {
      sellerType = 'business';
    }
  }

  const businessType = store.business_type || parsedTag.bt || '';
  const hasStorefront =
    store.has_storefront !== undefined && store.has_storefront !== null
      ? Boolean(store.has_storefront)
      : parsedTag.hs !== undefined
        ? Boolean(parsedTag.hs)
        : false;

  const streetAddress = store.street_address ?? parsedTag.sa ?? '';
  const addressVisibility =
    store.address_visibility || parsedTag.av || (hasStorefront ? 'exact' : 'approximate');
  const businessEmail = store.business_email || parsedTag.be || '';
  const businessPhone = store.business_phone || parsedTag.bp || '';
  const websiteUrl = store.website_url || parsedTag.ws || '';
  const businessHours = normalizeBusinessHours(store.business_hours || parsedTag.bh);

  const displayDescription =
    cleanDescription === 'Personal listings' || cleanDescription === 'Personal seller profile'
      ? ''
      : cleanDescription;

  return {
    sellerType,
    isQuickProfile: sellerType === 'quick',
    isPersonalProfile: sellerType === 'personal',
    isBusinessProfile: sellerType === 'business',
    businessType,
    businessTypeLabel: getBusinessTypeLabel(businessType),
    hasStorefront,
    streetAddress,
    addressVisibility,
    businessEmail,
    businessPhone,
    websiteUrl,
    businessHours,
    cleanDescription: displayDescription,
  };
}

/**
 * Format today's opening hours status for public display
 */
export function getTodayHoursStatus(businessHours) {
  if (!businessHours) return null;
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const now = new Date();
  const todayKey = dayKeys[now.getDay()];
  const todayObj = businessHours[todayKey];

  if (!todayObj || todayObj.closed) {
    return {
      isOpen: false,
      statusText: 'Closed today',
      hoursText: 'Closed',
      fullLabel: 'Closed today',
    };
  }

  const open12 = formatTime24To12(todayObj.open);
  const close12 = formatTime24To12(todayObj.close);

  // Check current time against open/close
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = String(todayObj.open || '09:00').split(':').map(Number);
  const [closeH, closeM] = String(todayObj.close || '18:00').split(':').map(Number);
  const openMinutes = (openH || 9) * 60 + (openM || 0);
  const closeMinutes = (closeH || 18) * 60 + (closeM || 0);
  const isOpenNow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  return {
    isOpen: isOpenNow,
    statusText: isOpenNow ? 'Open today' : 'Hours today',
    hoursText: `${open12} – ${close12}`,
    fullLabel: `Open today · ${open12} – ${close12}`,
  };
}

/**
 * Group weekly hours into concise summary lines (e.g. Mon – Fri: 9:00 AM – 6:00 PM)
 */
export function formatHoursSummary(businessHours) {
  const normalized = normalizeBusinessHours(businessHours);
  const monToFriSame = ['tue', 'wed', 'thu', 'fri'].every(
    (k) =>
      normalized[k].closed === normalized.mon.closed &&
      normalized[k].open === normalized.mon.open &&
      normalized[k].close === normalized.mon.close
  );

  if (monToFriSame) {
    const mfLabel = normalized.mon.closed
      ? 'Closed'
      : `${formatTime24To12(normalized.mon.open)} – ${formatTime24To12(normalized.mon.close)}`;
    const satLabel = normalized.sat.closed
      ? 'Closed'
      : `${formatTime24To12(normalized.sat.open)} – ${formatTime24To12(normalized.sat.close)}`;
    const sunLabel = normalized.sun.closed
      ? 'Closed'
      : `${formatTime24To12(normalized.sun.open)} – ${formatTime24To12(normalized.sun.close)}`;

    if (satLabel === mfLabel) {
      return [
        { days: 'Mon – Sat', hours: mfLabel },
        { days: 'Sun', hours: sunLabel },
      ];
    }
    return [
      { days: 'Mon – Fri', hours: mfLabel },
      { days: 'Sat', hours: satLabel },
      { days: 'Sun', hours: sunLabel },
    ];
  }

  return DAYS_OF_WEEK.map((d) => {
    const info = normalized[d.key];
    return {
      days: d.short,
      hours: info.closed
        ? 'Closed'
        : `${formatTime24To12(info.open)} – ${formatTime24To12(info.close)}`,
    };
  });
}


/**
 * Append [Seller_Identity] tag to product description when Personal or Business is explicitly chosen
 */
export function encodeProductSellerIdentity(description = '', identity = '') {
  const cleaned = String(description || '')
    .replace(/\n?\[Seller_Identity\]:[^\n]*/gi, '')
    .trim();
  if (!identity || identity === 'quick') return cleaned;
  return cleaned ? `${cleaned}\n[Seller_Identity]: ${identity}` : `[Seller_Identity]: ${identity}`;
}

/**
 * Resolve the public seller identity (Personal vs Business) for a product
 */
export function resolveProductSellerIdentity(product) {
  if (!product) {
    return {
      identityType: 'personal',
      isBusiness: false,
      badgeLabel: 'Personal Seller',
      displayName: 'Seller',
      avatarUrl: null,
      profileUrl: null,
      storeMeta: null,
    };
  }

  const desc = product.description || '';
  const tagMatch = desc.match(/\[Seller_Identity\]:\s*(personal|business)/i);
  const explicitIdentity =
    product.seller_identity || (tagMatch ? tagMatch[1].toLowerCase() : null);

  const store = product.stores || null;
  const user = product.users || null;
  const storeMeta = store ? parseStoreMeta(store) : null;

  const isBusiness =
    explicitIdentity === 'business'
      ? true
      : explicitIdentity === 'personal'
        ? false
        : Boolean(storeMeta?.isBusinessProfile);

  if (isBusiness && store) {
    return {
      identityType: 'business',
      isBusiness: true,
      badgeLabel: storeMeta?.businessTypeLabel || 'Business Seller',
      displayName: store.store_name || user?.full_name || user?.username || 'Business Seller',
      avatarUrl: store.logo_url || user?.avatar_url || null,
      profileUrl: store.slug ? `/store/${store.slug}` : null,
      isVerified: Boolean(store.is_verified),
      rating: store.average_rating,
      storeMeta,
    };
  }

  const personalName =
    user?.full_name ||
    user?.username ||
    store?.store_name ||
    'Seller';

  return {
    identityType: 'personal',
    isBusiness: false,
    badgeLabel: 'Personal Seller',
    displayName: personalName,
    avatarUrl: user?.avatar_url || store?.logo_url || null,
    profileUrl: user?.username
      ? `/user/${user.username}`
      : store?.slug
        ? `/store/${store.slug}`
        : null,
    isVerified: Boolean(store?.is_verified),
    rating: store?.average_rating,
    storeMeta,
  };
}
