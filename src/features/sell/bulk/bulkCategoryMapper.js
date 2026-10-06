// src/features/sell/bulk/bulkCategoryMapper.js
// ─────────────────────────────────────────────────────────────
// Maps every bulk listing to its best-fitting category_id by
// running keyword matching against the category tree fetched from
// GET /categories (cached in react-query).
//
// The mapper tries three layers in order:
//  1. Explicit "category" / "subcategory" columns from the CSV.
//  2. Smart keyword matching against the listing title + description.
//  3. Fallback to the root category for the bulk type.
// ─────────────────────────────────────────────────────────────

import { CATEGORY_IDS } from '../../../utils/constants.js';
import { BULK_TYPES } from './bulkSchema.js';

// ─────────────────────────────────────────────────────────────
// Keyword → slug prefix mappings (supplements the tree walk).
// These handle common product names that should land in specific
// categories even without a "category" column.
// ─────────────────────────────────────────────────────────────
const KEYWORD_ROUTES = [
  // Electronics > Phones
  { pattern: /\biphone\b/i, slug: 'electronics-phones-and-tablets-iphone' },
  { pattern: /\bsamsung\s*galaxy\b/i, slug: 'electronics-phones-and-tablets-samsung-galaxy' },
  { pattern: /\bgoogle\s*pixel\b/i, slug: 'electronics-phones-and-tablets-google-pixel' },
  { pattern: /\bsmartphone|cellphone|cell phone\b/i, slug: 'electronics-phones-and-tablets' },
  { pattern: /\b(ipad|tablet)\b/i, slug: 'electronics-phones-and-tablets-tablets' },
  { pattern: /\bsmartwatch|apple watch|galaxy watch\b/i, slug: 'electronics-phones-and-tablets-smartwatches' },
  { pattern: /\b(phone case|phone mount|phone holder|charger|lightning cable|usb-c cable)\b/i, slug: 'electronics-phones-and-tablets-phone-accessories' },

  // Electronics > Computers
  { pattern: /\b(macbook|macbook pro|macbook air)\b/i, slug: 'electronics-computers-macbooks' },
  { pattern: /\blaptop\b/i, slug: 'electronics-computers-laptops' },
  { pattern: /\bchromebook\b/i, slug: 'electronics-computers-chromebooks' },
  { pattern: /\bdesktop|imac|mac mini|mac pro|pc\b/i, slug: 'electronics-computers-desktop-computers' },
  { pattern: /\bgaming (pc|desktop|computer)\b/i, slug: 'electronics-computers-gaming-pcs' },
  { pattern: /\bmonitor\b/i, slug: 'electronics-computers-computer-monitors' },
  { pattern: /\bkeyboard\b/i, slug: 'electronics-computers-keyboards' },
  { pattern: /\bmouse|mice\b/i, slug: 'electronics-computers-mice' },

  // Electronics > TVs
  { pattern: /\b(smart tv|roku tv|oled tv|led tv|qled|television)\b/i, slug: 'electronics-tvs-and-home-theater-smart-tvs' },
  { pattern: /\btv\b/i, slug: 'electronics-tvs-and-home-theater-tvs' },
  { pattern: /\bsoundbar\b/i, slug: 'electronics-tvs-and-home-theater-soundbars' },
  { pattern: /\bprojector\b/i, slug: 'electronics-tvs-and-home-theater-projectors' },

  // Electronics > Gaming
  { pattern: /\bplaystation|ps5|ps4|ps3\b/i, slug: 'electronics-gaming-playstation' },
  { pattern: /\bxbox\b/i, slug: 'electronics-gaming-xbox' },
  { pattern: /\bnintendo\b/i, slug: 'electronics-gaming-nintendo' },
  { pattern: /\b(video game|game disc|game cartridge)\b/i, slug: 'electronics-gaming-video-games' },
  { pattern: /\bvr headset|oculus|meta quest\b/i, slug: 'electronics-gaming-vr-headsets' },

  // Electronics > Cameras
  { pattern: /\bdrone\b/i, slug: 'electronics-cameras-drones' },
  { pattern: /\b(gopro|action camera)\b/i, slug: 'electronics-cameras-action-cameras' },
  { pattern: /\bdslr\b/i, slug: 'electronics-cameras-dslr' },
  { pattern: /\bmirrorless\b/i, slug: 'electronics-cameras-mirrorless' },
  { pattern: /\b(camera|digital camera)\b/i, slug: 'electronics-cameras-digital-cameras' },

  // Electronics > Audio
  { pattern: /\bheadphone|headset\b/i, slug: 'electronics-audio-headphones' },
  { pattern: /\bearbud|airpod|galaxy bud\b/i, slug: 'electronics-audio-earbuds' },
  { pattern: /\b(bluetooth speaker|jbl|bose speaker)\b/i, slug: 'electronics-audio-bluetooth-speakers' },
  { pattern: /\bmicrophone\b/i, slug: 'electronics-audio-microphones' },

  // Fashion
  { pattern: /\bsneaker|shoe\b/i, slug: 'shoes' },

  // Appliances
  { pattern: /\brefrigerator|fridge\b/i, slug: 'appliances-refrigerators' },
  { pattern: /\bwash(er|ing machine)\b/i, slug: 'appliances-washers' },
  { pattern: /\bdryer\b/i, slug: 'appliances-dryers' },
  { pattern: /\bdishwasher\b/i, slug: 'appliances-dishwashers' },
  { pattern: /\bair fryer\b/i, slug: 'appliances-air-fryers' },
  { pattern: /\bmicrowave\b/i, slug: 'appliances-microwaves' },
  { pattern: /\bvacuum\b/i, slug: 'appliances-vacuum-cleaners' },
  { pattern: /\bcoffee maker|espresso\b/i, slug: 'appliances-coffee-makers' },
  { pattern: /\bblender\b/i, slug: 'appliances-blenders' },
  { pattern: /\bair conditioner|ac unit|window unit\b/i, slug: 'appliances-air-conditioners' },
  { pattern: /\boven|range\b/i, slug: 'appliances-ovens' },
  { pattern: /\bstove|cooktop\b/i, slug: 'appliances-stoves' },

  // Vehicles (for parts)
  { pattern: /\b(tire|tyre|wheel|rim|hubcap)\b/i, slug: 'vehicles-vehicle-accessories-wheels' },
  { pattern: /\broof rack\b/i, slug: 'vehicles-vehicle-accessories-roof-racks' },
  { pattern: /\btow(ing|bar|hitch)\b/i, slug: 'vehicles-vehicle-accessories-towing-equipment' },
  { pattern: /\b(car seat cover|steering wheel cover|floor mat)\b/i, slug: 'vehicles-vehicle-accessories-interior-accessories' },

  // Baby & Kids
  { pattern: /\b(stroller|car seat|baby carrier)\b/i, slug: 'baby-and-kids-baby-gear' },
  { pattern: /\b(baby cloth|onesie|baby dress)\b/i, slug: 'baby-and-kids-baby-clothing' },
  { pattern: /\bcrib|bassinet|nursery\b/i, slug: 'baby-and-kids-nursery' },

  // Tools
  { pattern: /\bdrill\b/i, slug: 'tools-and-equipment-power-tools-drills' },
  { pattern: /\bwrench\b/i, slug: 'tools-and-equipment-hand-tools-wrenches' },
  { pattern: /\bgenerator\b/i, slug: 'tools-and-equipment-equipment-generators' },

  // Collectibles
  { pattern: /\bbaseball card|pokemon card|trading card|sports card\b/i, slug: 'collectibles-and-memorabilia-trading-cards' },
  { pattern: /\blego\b/i, slug: 'toys-and-games-lego-and-building-sets' },
  { pattern: /\baction figure\b/i, slug: 'toys-and-games-action-figures' },
  { pattern: /\bboard game\b/i, slug: 'toys-and-games-board-games' },

  // Musical Instruments
  { pattern: /\bguitar\b/i, slug: 'musical-instruments-guitars' },
  { pattern: /\bpiano\b/i, slug: 'musical-instruments-pianos' },
  { pattern: /\bdrum\b/i, slug: 'musical-instruments-drums' },
  { pattern: /\bviolin\b/i, slug: 'musical-instruments-violins' },
];

// ─────────────────────────────────────────────────────────────
// Build a fast lookup by slug when categories are fetched
// ─────────────────────────────────────────────────────────────
function buildSlugMap(flatCategories) {
  const map = {};
  flatCategories.forEach((c) => {
    map[c.slug] = c.id;
  });
  return map;
}

function buildNameMap(flatCategories) {
  const map = {};
  flatCategories.forEach((c) => {
    const key = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    map[key] = c.id;
    // also add slug words as fallback
    map[c.slug.replace(/-/g, '')] = c.id;
  });
  return map;
}

/**
 * Resolve a category_id from a CSV path string like "Electronics > Phones & Tablets > iPhone".
 * @returns {string|null} category_id or null
 */
function resolvePathText(pathText, flatCategories, slugMap, nameMap) {
  if (!pathText) return null;
  const cleaned = String(pathText).trim();
  if (!cleaned) return null;

  // Split on > or / or → separator
  const parts = cleaned.split(/[>/→]+/).map((p) => p.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')).filter(Boolean);

  // Try matching the deepest (last) segment first
  for (let i = parts.length - 1; i >= 0; i--) {
    if (nameMap[parts[i]]) return nameMap[parts[i]];
  }

  // Reconstruct expected slug and try
  const attemptSlug = parts.join('-');
  if (slugMap[attemptSlug]) return slugMap[attemptSlug];

  return null;
}

/**
 * Resolve a category_id using keyword matching against listing text.
 * @param {string} text   primary text (title + brand)
 * @param {string} desc   secondary text (description)
 * @param {object} slugMap
 * @returns {string|null}
 */
function resolveKeyword(text, desc, slugMap) {
  const combined = [text, desc].join(' ');
  for (const rule of KEYWORD_ROUTES) {
    if (rule.pattern.test(combined)) {
      // Walk up slug to find deepest available
      let slug = rule.slug;
      while (slug) {
        if (slugMap[slug]) return slugMap[slug];
        const idx = slug.lastIndexOf('-');
        if (idx <= 0) break;
        slug = slug.substring(0, idx);
      }
    }
  }
  return null;
}

/**
 * Get the root fallback category_id for the bulk type.
 */
function rootFallback(type) {
  if (type === BULK_TYPES.VEHICLES) return CATEGORY_IDS.VEHICLES;
  if (type === BULK_TYPES.REAL_ESTATE) return CATEGORY_IDS.REAL_ESTATE;
  return CATEGORY_IDS.ELECTRONICS; // marketplace falls back to Electronics
}

/**
 * Resolve category_id for one listing row.
 *
 * @param {Object} row         normalized row object (has category, subcategory, etc.)
 * @param {Object} built       buildListing() result
 * @param {string} type        BULK_TYPES
 * @param {Array}  flatCategories   from GET /categories/flat
 * @returns {{ categoryId: string, categoryName: string, autoMapped: boolean }}
 */
export function resolveCategory(row, built, type, flatCategories = []) {
  const slugMap = buildSlugMap(flatCategories);
  const nameMap = buildNameMap(flatCategories);

  // 1. Explicit CSV columns
  const explicitSub = resolvePathText(row.subcategory, flatCategories, slugMap, nameMap);
  if (explicitSub) {
    const cat = flatCategories.find((c) => c.id === explicitSub);
    return { categoryId: explicitSub, categoryName: cat?.name || '', autoMapped: false };
  }
  const explicitPrimary = resolvePathText(row.category, flatCategories, slugMap, nameMap);
  if (explicitPrimary) {
    const cat = flatCategories.find((c) => c.id === explicitPrimary);
    return { categoryId: explicitPrimary, categoryName: cat?.name || '', autoMapped: false };
  }

  // 2. Real estate has a fixed root category
  if (type === BULK_TYPES.REAL_ESTATE) {
    return { categoryId: CATEGORY_IDS.REAL_ESTATE, categoryName: 'Real Estate', autoMapped: true };
  }

  // 3. Automotive – special hints
  if (type === BULK_TYPES.VEHICLES) {
    const hints = built.vehicleHints;
    if (hints?.isAccessory) {
      return { categoryId: CATEGORY_IDS.AUTO_PARTS_ACCESSORIES, categoryName: 'Auto Parts & Accessories', autoMapped: true };
    }
    return { categoryId: CATEGORY_IDS.VEHICLES, categoryName: 'Vehicles', autoMapped: true };
  }

  // 4. Keyword matching for marketplace
  const primary = built.categoryText?.primary || '';
  const secondary = built.categoryText?.secondary || '';
  const keyId = resolveKeyword(primary, secondary, slugMap);
  if (keyId) {
    const cat = flatCategories.find((c) => c.id === keyId);
    return { categoryId: keyId, categoryName: cat?.name || '', autoMapped: true };
  }

  // 5. Root fallback
  const rootId = rootFallback(type);
  const rootCat = flatCategories.find((c) => c.id === rootId);
  return { categoryId: rootId, categoryName: rootCat?.name || type, autoMapped: true };
}
