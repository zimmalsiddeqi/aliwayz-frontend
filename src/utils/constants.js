// ─────────────────────────────────────────
// App constants — mirrors backend constants
// ─────────────────────────────────────────

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Aliwayz';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// ── User Roles ─────────────────────────────────────────────────
export const ROLES = {
  GUEST:  'guest',
  BUYER:  'buyer',
  SELLER: 'seller',
  BOTH:   'both',
  ADMIN:  'admin',
};

export const SELLER_ROLES = [ROLES.SELLER, ROLES.BOTH, ROLES.ADMIN];
export const BUYER_ROLES  = [ROLES.BUYER,  ROLES.BOTH, ROLES.ADMIN];

// ── Product Status ─────────────────────────────────────────────
export const PRODUCT_STATUS = {
  AVAILABLE: 'available',
  RESERVED:  'reserved',
  SOLD:      'sold',
  HIDDEN:    'hidden',
  DRAFT:     'draft',
};

// ── ITEM Conditions ─────────────────────────────────────────
export const ITEM_CONDITIONS = [
  { value: 'new',       label: 'Brand New (Unopened / In Box)' },
  { value: 'like_new',  label: 'Like New (Lightly Used)' },
  { value: 'good',      label: 'Good (Fully Functional)' },
  { value: 'fair',      label: 'Fair (Visible Wear)' },
  { value: 'poor',      label: 'For Parts / Not Working' },
];

// ── Notification Types ─────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE:     'new_message',
  NEW_FOLLOWER:    'new_follower',
  PRICE_UPDATE:    'price_update',
  PRODUCT_SOLD:    'product_sold',
  REVIEW_RECEIVED: 'review_received',
  ADMIN_MESSAGE:   'admin_message',
  QR_GENERATED:    'qr_generated',
  BADGE_EARNED:    'badge_earned',
  REPORT_RESOLVED: 'report_resolved',
};

// ── Report Reasons ─────────────────────────────────────────────
export const REPORT_REASONS = [
  { value: 'spam',          label: 'Spam' },
  { value: 'counterfeit',   label: 'Counterfeit Item' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'scam',          label: 'Scam' },
  { value: 'harassment',    label: 'Harassment' },
  { value: 'other',         label: 'Other' },
];

// ── Sort Options ───────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular' },
];

export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance',  label: 'Most Relevant' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular' },
];

// ── File Limits ────────────────────────────────────────────────
export const MAX_PRODUCT_IMAGES = 20;
export const MAX_IMAGE_SIZE_MB  = 10;
export const MAX_VIDEO_SIZE_MB  = 100;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

// ── Pagination ─────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE     = 50;

// ── Cache TTLs (ms) ────────────────────────────────────────────
export const CACHE_TIMES = {
  SHORT:  30 * 1000,        // 30 seconds
  MEDIUM: 2 * 60 * 1000,   // 2 minutes
  LONG:   10 * 60 * 1000,  // 10 minutes
  HOUR:   60 * 60 * 1000,  // 1 hour
};

// ── Badge Codes ────────────────────────────────────────────────
export const BADGE_CODES = {
  NEW_SELLER:     'new_seller',
  VERIFIED_SELLER:'verified_seller',
  RATED_100:      '100_rated',
  RATED_500:      '500_rated',
  TOP_SELLER:     'top_seller',
  TRUSTED_BUYER:  'trusted_buyer',
};

// ── Review Tags ────────────────────────────────────────────────
export const BUYER_REVIEW_TAGS = [
  { key: 'tag_friendly',        label: 'Friendly',          emoji: '😊' },
  { key: 'tag_fast',            label: 'Fast',              emoji: '⚡' },
  { key: 'tag_accurate',        label: 'Accurate Description', emoji: '✅' },
  { key: 'tag_great_comm',      label: 'Great Communication', emoji: '💬' },
  { key: 'tag_would_buy_again', label: 'Would Buy Again',   emoji: '🔄' },
];

export const SELLER_REVIEW_TAGS = [
  { key: 'tag_friendly',         label: 'Friendly',          emoji: '😊' },
  { key: 'tag_fast',             label: 'Fast',              emoji: '⚡' },
  { key: 'tag_great_comm',       label: 'Great Communication', emoji: '💬' },
  { key: 'tag_would_sell_again', label: 'Would Sell Again',  emoji: '🔄' },
];

// ── Account Status ─────────────────────────────────────────────
export const ACCOUNT_STATUS = {
  ACTIVE:    'active',
  SUSPENDED: 'suspended',
  BANNED:    'banned',
  PENDING:   'pending',
};

// ═══════════════════════════════════════════════════════════════
// MAIN MARKETPLACE CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const MAIN_CATEGORIES = {
  VEHICLES:    'vehicles',
  REAL_ESTATE: 'real-estate',
  ESSENTIALS:  'essentials',
};

export const MAIN_CATEGORY_CONFIG = [
  {
    id:          MAIN_CATEGORIES.ESSENTIALS,
    name:        'Everyday Essentials',
    emoji:       '🛒',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    description: 'Electronics, fashion, home goods & everything else',
    color:       '#8B5CF6',
  },
  {
    id:          MAIN_CATEGORIES.VEHICLES,
    name:        'Vehicles',
    emoji:       '🚗',
    gradient:    'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    description: 'Cars, trucks, motorcycles & powersports',
    color:       '#3B82F6',
  },
  {
    id:          MAIN_CATEGORIES.REAL_ESTATE,
    name:        'Real Estate',
    emoji:       '🏠',
    gradient:    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    description: 'Homes, apartments, land & commercial spaces',
    color:       '#10B981',
  },
];

// ═══════════════════════════════════════════════════════════════
// CAR-SPECIFIC OPTIONS
// ═══════════════════════════════════════════════════════════════

export const VEHICLE_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
  'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai',
  'Infiniti', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln',
  'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan',
  'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen',
  'Volvo', 'Other',
];

export const VEHICLE_BODY_TYPES = [
  { value: 'sedan',       label: 'Sedan' },
  { value: 'suv',         label: 'SUV / Crossover' },
  { value: 'truck',       label: 'Pickup Truck' },
  { value: 'coupe',       label: 'Coupe / Sports Car' },
  { value: 'van',         label: 'Van / Minivan' },
  { value: 'wagon',       label: 'Wagon' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'hatchback',   label: 'Hatchback' },
  { value: 'ev',          label: 'Electric Vehicle (EV)' },
];

export const VEHICLE_FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel',   label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid',   label: 'Hybrid' },
  { value: 'flex',     label: 'Flex Fuel' },
];

export const VEHICLE_TRANSMISSIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual',    label: 'Manual' },
  { value: 'cvt',       label: 'CVT' },
];

export const VEHICLE_DRIVETRAINS = [
  { value: 'fwd', label: 'FWD (Front-Wheel Drive)' },
  { value: 'rwd', label: 'RWD (Rear-Wheel Drive)' },
  { value: 'awd', label: 'AWD (All-Wheel Drive)' },
  { value: '4wd', label: '4WD (Four-Wheel Drive)' },
];

export const VEHICLE_TITLE_STATUS = [
  { value: 'clean',    label: 'Clean Title' },
  { value: 'salvage',  label: 'Salvage Title' },
  { value: 'rebuilt',  label: 'Rebuilt Title' },
  { value: 'flood',    label: 'Flood Damage' },
  { value: 'lemon',    label: 'Lemon Title' },
];

export const VEHICLE_SELLER_TYPE = [
  { value: 'private',    label: 'Private Party' },
  { value: 'dealership', label: 'Licensed Dealership' },
];

export const VEHICLE_CONDITIONS = [
  { value: 'new',                label: 'Brand New' },
  { value: 'certified_preowned', label: 'Certified Pre-Owned (CPO)' },
  { value: 'used_excellent',     label: 'Excellent' },
  { value: 'used_good',          label: 'Good' },
  { value: 'used_fair',          label: 'Fair' },
];

export const VEHICLE_FEATURES = [
  { key: 'ac',              label: 'A/C',                emoji: '❄️' },
  { key: 'power_steering',  label: 'Power Steering',     emoji: '🔄' },
  { key: 'power_windows',   label: 'Power Windows',      emoji: '🪟' },
  { key: 'abs',             label: 'ABS',                emoji: '🛑' },
  { key: 'airbags',         label: 'Airbags',            emoji: '🎈' },
  { key: 'sunroof',         label: 'Sunroof / Moonroof', emoji: '☀️' },
  { key: 'navigation',      label: 'Navigation / GPS',   emoji: '🗺️' },
  { key: 'bluetooth',       label: 'Bluetooth',          emoji: '📶' },
  { key: 'backup_camera',   label: 'Backup Camera',      emoji: '📷' },
  { key: 'parking_sensors', label: 'Parking Sensors',    emoji: '📡' },
  { key: 'cruise_control',  label: 'Cruise Control',     emoji: '🚀' },
  { key: 'leather_seats',   label: 'Leather Seats',      emoji: '💺' },
  { key: 'heated_seats',    label: 'Heated Seats',       emoji: '🔥' },
  { key: 'keyless_entry',   label: 'Keyless Entry',      emoji: '🔑' },
  { key: 'push_start',      label: 'Push Button Start',  emoji: '⚡' },
  { key: 'alloy_wheels',    label: 'Alloy Wheels',       emoji: '🛞' },
  { key: 'tow_package',     label: 'Tow Package',        emoji: '🪝' },
  { key: 'roof_rack',       label: 'Roof Rack',          emoji: '🏗️' },
  { key: 'remote_start',    label: 'Remote Start',       emoji: '📱' },
  { key: 'blind_spot',      label: 'Blind Spot Monitor', emoji: '👁️' },
];

export const VEHICLE_YEAR_RANGE = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 1; y >= 1990; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
})();

// ═══════════════════════════════════════════════════════════════
// PROPERTY-SPECIFIC OPTIONS
// ═══════════════════════════════════════════════════════════════

export const REAL_ESTATE_TYPES = [
  { value: 'single_family', label: 'Single-Family Home',  emoji: '🏠' },
  { value: 'townhome',      label: 'Townhome',            emoji: '🏘️' },
  { value: 'condo',         label: 'Condo / Co-op',       emoji: '🏢' },
  { value: 'multi_family',  label: 'Multi-Family',        emoji: '🏗️' },
  { value: 'apartment',     label: 'Apartment',           emoji: '🏬' },
  { value: 'room',          label: 'Room / Sublet',       emoji: '🚪' },
  { value: 'land',          label: 'Land / Lot',          emoji: '🌍' },
  { value: 'commercial',    label: 'Commercial Space',    emoji: '🏪' },
  { value: 'office',        label: 'Office Space',        emoji: '💼' },
  { value: 'industrial',    label: 'Industrial / Warehouse', emoji: '📦' },
  { value: 'vacation',      label: 'Vacation Rental',     emoji: '🏖️' },
];

export const REAL_ESTATE_PURPOSE = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

export const AREA_UNITS = [
  { value: 'sqft',  label: 'Sq. Ft.' },
  { value: 'acres', label: 'Acres' },
  { value: 'sqm',   label: 'Sq. M.' },
];

export const FURNISHING_OPTIONS = [
  { value: 'furnished',      label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Partially Furnished' },
  { value: 'unfurnished',    label: 'Unfurnished' },
];

export const LEASE_TERMS = [
  { value: '12_months',      label: '12 Months' },
  { value: '6_months',       label: '6 Months' },
  { value: 'month_to_month', label: 'Month-to-Month' },
  { value: 'flexible',       label: 'Flexible' },
];

export const PET_POLICY = [
  { value: 'dogs_cats',  label: 'Dogs & Cats Allowed' },
  { value: 'dogs_only',  label: 'Dogs Only' },
  { value: 'cats_only',  label: 'Cats Only' },
  { value: 'no_pets',    label: 'No Pets' },
  { value: 'negotiable', label: 'Negotiable' },
];

export const REAL_ESTATE_FEATURES = [
  { key: 'garage',          label: 'Garage',              emoji: '🚗' },
  { key: 'yard',            label: 'Yard / Lawn',         emoji: '🌳' },
  { key: 'pool',            label: 'Pool',                emoji: '🏊' },
  { key: 'gym',             label: 'Gym / Fitness Center', emoji: '💪' },
  { key: 'elevator',        label: 'Elevator',            emoji: '🛗' },
  { key: 'doorman',         label: 'Doorman / Concierge', emoji: '🚪' },
  { key: 'laundry_unit',    label: 'In-Unit Laundry',     emoji: '🧺' },
  { key: 'laundry_building',label: 'Laundry in Building', emoji: '🏢' },
  { key: 'dishwasher',      label: 'Dishwasher',          emoji: '🍽️' },
  { key: 'central_ac',      label: 'Central A/C',         emoji: '❄️' },
  { key: 'central_heat',    label: 'Central Heat',        emoji: '🌡️' },
  { key: 'fireplace',       label: 'Fireplace',           emoji: '🔥' },
  { key: 'hardwood',        label: 'Hardwood Floors',     emoji: '🪵' },
  { key: 'parking',         label: 'Parking',             emoji: '🅿️' },
  { key: 'storage',         label: 'Storage Unit',        emoji: '📦' },
  { key: 'rooftop',         label: 'Rooftop Access',      emoji: '🌆' },
  { key: 'balcony',         label: 'Balcony / Patio',     emoji: '🏗️' },
  { key: 'security',        label: '24/7 Security',       emoji: '🔒' },
  { key: 'wheelchair',      label: 'Wheelchair Accessible', emoji: '♿' },
  { key: 'hoa',             label: 'HOA Community',       emoji: '🏘️' },
];

export const BEDROOM_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '1',      label: '1 Bd' },
  { value: '2',      label: '2 Bd' },
  { value: '3',      label: '3 Bd' },
  { value: '4',      label: '4 Bd' },
  { value: '5',      label: '5 Bd' },
  { value: '6+',     label: '6+ Bd' },
];

export const BATHROOM_OPTIONS = [
  { value: '1',   label: '1 Ba' },
  { value: '1.5', label: '1.5 Ba' },
  { value: '2',   label: '2 Ba' },
  { value: '2.5', label: '2.5 Ba' },
  { value: '3',   label: '3 Ba' },
  { value: '3.5', label: '3.5 Ba' },
  { value: '4+',  label: '4+ Ba' },
];

// ═══════════════════════════════════════════════════════════════
// REAL DATABASE CATEGORY IDs
// ═══════════════════════════════════════════════════════════════

export const CATEGORY_IDS = {
  // Main categories
  AUTOMOTIVE: 'b97e0e52-0c29-431d-85c7-2ccddc9ebb42',
  PROPERTY:   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',

  // Automotive children
  AUTOMOTIVE_PARTS:  '00990569-026a-44ac-815a-158390296c8e',
  MOTORCYCLE_PARTS:  '33de6166-82a6-4f98-885a-8d3fe5ffb35a',

  // Daily Use — all IDs
  ELECTRONICS:      '61ad497c-fca7-4614-8c44-5bbad8396048',
  PHONES:           'c10bf79f-cba5-449a-841e-cbc127f20462',
  LAPTOPS:          '33aa09bd-032f-47c6-bae4-5dedb7118d6c',
  GAMING:           '5fff04c6-4486-4c0c-b0d9-a3aa587ebf82',
  FASHION:          '367c3135-ea38-4fbf-a661-0253052b3aa4',
  SHOES:            'bdd0dbff-395b-4808-9693-69edbf2cd2ab',
  BAGS:             '348d03b9-486f-4f73-b499-d425c801136b',
  JEWELRY:          '2104847e-6e78-4e20-bcbc-313605f1db37',
  BEAUTY:           'aae77266-a512-4134-97a4-ecd1ca15bd05',
  HOME:             '5f1bb35e-c0d0-4516-9661-1127161f67b1',
  KITCHEN:          '106ea184-65b2-44c0-873d-bbe2515098a6',
  FURNITURE:        '8942d610-73f1-4bd6-84e9-df2cfc0a1b79',
  APPLIANCES:       '0c2e41ec-ab1b-484c-b273-4d82c850cdb1',
  SPORTS:           '7cc3f036-78d0-4036-b61c-bb96395ec5ca',
  FITNESS:          'f2965630-9869-439f-bc08-f0a81269cb0a',
  BOOKS:            '6a110d8a-f8bd-44bd-ae7d-4c261c0b62dc',
  TOYS:             'e9bcb859-7ae0-4cf2-b6dc-e0c6faab8e72',
  BABY:             'a810198e-7356-418d-bc31-e4235a22e717',
  PETS:             '50c4a132-5253-48e6-81b8-7cc1e2a5ba9b',
  GARDEN:           '1f73b2eb-2a98-49d8-bcf1-33809ba2894c',
  TOOLS:            '7071e708-507b-490e-b430-17b14f316f92',
  OFFICE:           '96432295-f4b5-425a-8ffb-3c48dd650a5f',
  MUSIC:            '060c8858-fa3e-47c3-882c-89d22dc39ac9',
  COLLECTIBLES:     'eb392584-1d02-42f3-bd00-39059460144a',
  PHOTOGRAPHY:      'e43122be-dbdf-4cfd-98ca-741e8ce720df',
  DRONES:           '6642d96e-3120-4461-a476-97bb764613fe',
  ART:              'a07be76a-4c1d-4f80-a616-85530e6b47d9',
  HANDMADE:         '540cfd93-ba81-4f0e-a53f-22ec6ab00cb9',
  DIGITAL_PRODUCTS: '5dd7db21-c0a7-44c3-b033-2cc2880f2675',
  OTHER:            '84bcf437-ce26-4d0d-9d23-e434db31893d',
};

// Which category IDs belong to DAILY USE
export const DAILY_USE_CATEGORY_IDS = [
  'b97e0e52-0c29-431d-85c7-2ccddc9ebb42', // Keep automotive OUT (cars)
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Keep property OUT
].includes.length === 0 ? [] : [
  '61ad497c-fca7-4614-8c44-5bbad8396048', // Electronics
  '367c3135-ea38-4fbf-a661-0253052b3aa4', // Fashion
  '5f1bb35e-c0d0-4516-9661-1127161f67b1', // Home
  '7cc3f036-78d0-4036-b61c-bb96395ec5ca', // Sports
  '6a110d8a-f8bd-44bd-ae7d-4c261c0b62dc', // Books
  'e9bcb859-7ae0-4cf2-b6dc-e0c6faab8e72', // Toys
  'a810198e-7356-418d-bc31-e4235a22e717', // Baby
  '50c4a132-5253-48e6-81b8-7cc1e2a5ba9b', // Pets
  '1f73b2eb-2a98-49d8-bcf1-33809ba2894c', // Garden
  '7071e708-507b-490e-b430-17b14f316f92', // Tools
  '96432295-f4b5-425a-8ffb-3c48dd650a5f', // Office
  '060c8858-fa3e-47c3-882c-89d22dc39ac9', // Music
  'eb392584-1d02-42f3-bd00-39059460144a', // Collectibles
  'e43122be-dbdf-4cfd-98ca-741e8ce720df', // Photography
  '6642d96e-3120-4461-a476-97bb764613fe', // Drones
  'a07be76a-4c1d-4f80-a616-85530e6b47d9', // Art
  '540cfd93-ba81-4f0e-a53f-22ec6ab00cb9', // Handmade
  '5dd7db21-c0a7-44c3-b033-2cc2880f2675', // Digital Products
  '84bcf437-ce26-4d0d-9d23-e434db31893d', // Other
];

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES
// Old names → New names mapping
// ═══════════════════════════════════════════════════════════════

// Vehicle aliases (old CAR_ → new VEHICLE_)
export const CAR_MAKES         = VEHICLE_MAKES;
export const CAR_BODY_TYPES    = VEHICLE_BODY_TYPES;
export const CAR_FUEL_TYPES    = VEHICLE_FUEL_TYPES;
export const CAR_TRANSMISSIONS = VEHICLE_TRANSMISSIONS;
export const CAR_CONDITIONS    = VEHICLE_CONDITIONS;
export const CAR_FEATURES      = VEHICLE_FEATURES;
export const CAR_YEAR_RANGE    = VEHICLE_YEAR_RANGE;

// Real Estate aliases (old PROPERTY_ → new REAL_ESTATE_)
export const PROPERTY_TYPES    = REAL_ESTATE_TYPES;
export const PROPERTY_PURPOSE  = REAL_ESTATE_PURPOSE;
export const PROPERTY_FEATURES = REAL_ESTATE_FEATURES;

// Item condition alias (old CONDITIONS → new ITEM_CONDITIONS)
export const CONDITIONS = ITEM_CONDITIONS;

// Category aliases (old MAIN_CATEGORIES values → new ones)
// These ensure old route checks still work
//export { MAIN_CATEGORIES };