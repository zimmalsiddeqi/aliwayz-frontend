// src/features/sell/bulk/bulkSchema.js
// ─────────────────────────────────────────────────────────────
// Column definitions, header recognition, value normalization and
// per-row listing builders for Bulk Upload.
//
// The payloads produced here are identical in shape to the ones the
// existing single-listing forms (DailyProductForm, CarListingForm,
// PropertyListingForm) send to POST /products, so the backend and every
// listing detail page keep working with no changes.
// ─────────────────────────────────────────────────────────────

import {
  MAIN_CATEGORIES,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_DRIVETRAINS,
  VEHICLE_BODY_TYPES,
  VEHICLE_TITLE_STATUS,
  VEHICLE_SELLER_TYPE,
  REAL_ESTATE_TYPES,
} from '../../../utils/constants.js';

export const BULK_TYPES = {
  ESSENTIALS: MAIN_CATEGORIES.ESSENTIALS,
  VEHICLES: MAIN_CATEGORIES.VEHICLES,
  REAL_ESTATE: MAIN_CATEGORIES.REAL_ESTATE,
};

export const BULK_TYPE_INFO = {
  [BULK_TYPES.ESSENTIALS]: {
    id: BULK_TYPES.ESSENTIALS,
    label: 'Marketplace',
    emoji: '🛒',
    desc: 'Electronics, fashion, home goods & more',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
    fileName: 'aliwayz-marketplace-bulk-template.csv',
  },
  [BULK_TYPES.VEHICLES]: {
    id: BULK_TYPES.VEHICLES,
    label: 'Automotive',
    emoji: '🚗',
    desc: 'Cars, trucks, motorcycles, RVs, boats & parts',
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    fileName: 'aliwayz-automotive-bulk-template.csv',
  },
  [BULK_TYPES.REAL_ESTATE]: {
    id: BULK_TYPES.REAL_ESTATE,
    label: 'Real Estate',
    emoji: '🏠',
    desc: 'Homes, apartments, land & commercial',
    gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
    fileName: 'aliwayz-real-estate-bulk-template.csv',
  },
};

export const MAX_BULK_ROWS = 300;
export const MAX_BULK_FILE_MB = 5;

// ─────────────────────────────────────────────────────────────
// Real estate option tables (mirrors CreateListingPage wizard)
// ─────────────────────────────────────────────────────────────
export const RE_INTENTS = [
  { value: 'sale', label: 'For Sale', aliases: ['for sale', 'sell', 'selling', 'sell a property', 'buy'] },
  { value: 'rent', label: 'For Rent', aliases: ['for rent', 'rental', 'rent a property', 'renting'] },
  { value: 'lease', label: 'For Lease', aliases: ['for lease', 'commercial lease', 'lease commercial space'] },
  {
    value: 'vacation',
    label: 'Vacation Rental',
    aliases: ['vacation rental', 'short term', 'short term rental', 'airbnb', 'holiday rental'],
  },
];

export const RE_TYPES_BY_INTENT = {
  sale: [
    { value: 'single_family', label: 'Single-Family Home' },
    { value: 'townhome', label: 'Townhouse' },
    { value: 'condo', label: 'Condo / Co-op' },
    { value: 'multi_family', label: 'Multi-Family' },
    { value: 'apartment', label: 'Apartment Building' },
    { value: 'mobile_home', label: 'Mobile / Manufactured Home' },
    { value: 'land', label: 'Land / Lot' },
    { value: 'commercial', label: 'Commercial Property' },
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'industrial', label: 'Industrial / Warehouse' },
    { value: 'mixed_use', label: 'Mixed Use' },
    { value: 'parking', label: 'Parking' },
  ],
  rent: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'single_family', label: 'House' },
    { value: 'townhome', label: 'Townhouse' },
    { value: 'condo', label: 'Condo' },
    { value: 'room', label: 'Room' },
    { value: 'basement', label: 'Basement' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'multi_family', label: 'Multi-Family' },
    { value: 'mobile_home', label: 'Mobile / Manufactured' },
    { value: 'student_housing', label: 'Student Housing' },
    { value: 'senior_housing', label: 'Senior Housing' },
  ],
  lease: [
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant / Food Service' },
    { value: 'medical', label: 'Medical' },
    { value: 'industrial', label: 'Warehouse' },
    { value: 'industrial_flex', label: 'Industrial / Flex Space' },
    { value: 'land', label: 'Commercial Land' },
    { value: 'parking', label: 'Parking' },
    { value: 'storage', label: 'Storage' },
    { value: 'mixed_use', label: 'Mixed Use' },
  ],
  vacation: [
    { value: 'single_family', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'guest_house', label: 'Guest House' },
    { value: 'room', label: 'Room' },
  ],
};

const RE_TYPE_SYNONYMS = {
  house: 'single_family',
  home: 'single_family',
  singlefamily: 'single_family',
  singlefamilyhome: 'single_family',
  townhouse: 'townhome',
  coop: 'condo',
  condominium: 'condo',
  multifamilyhome: 'multi_family',
  lot: 'land',
  warehouse: 'industrial',
  flex: 'industrial_flex',
  mobile: 'mobile_home',
  manufactured: 'mobile_home',
  shop: 'retail',
  studio: 'apartment',
  flat: 'apartment',
  sublet: 'room',
  food: 'restaurant',
  mixeduse: 'mixed_use',
};

// ─────────────────────────────────────────────────────────────
// Column definitions
// col: { key, label, required, recommended, aliases, example: [row1, row2], hint, group }
// ─────────────────────────────────────────────────────────────
const COMMON_CATEGORY_COLS = [
  {
    key: 'category',
    label: 'Category',
    aliases: ['main_category', 'category_name', 'category_path'],
    hint: 'Optional. Leave blank and we will map it for you. Example: Electronics > Phones & Tablets > iPhone',
    example: ['', ''],
  },
  {
    key: 'subcategory',
    label: 'Subcategory',
    aliases: ['sub_category', 'sub_cat', 'subcategory_name'],
    hint: 'Optional. Overrides the automatic subcategory match.',
    example: ['', ''],
  },
];

const ESSENTIALS_COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    required: true,
    aliases: ['name', 'product_name', 'item_name', 'item', 'product', 'listing_title'],
    hint: '3 to 200 characters',
    example: ['iPhone 14 Pro 256GB Deep Purple', 'Nike Air Max 90 Sneakers Size 10'],
  },
  {
    key: 'description',
    label: 'Description',
    recommended: true,
    aliases: ['details', 'desc', 'product_description', 'item_description'],
    hint: 'Up to 5,000 characters',
    example: ['Unlocked, battery health 94%, includes original box.', 'Worn twice. Original box included.'],
  },
  {
    key: 'price',
    label: 'Price',
    required: true,
    aliases: ['price_usd', 'amount', 'cost', 'asking_price', 'usd'],
    hint: 'Number in US dollars, greater than 0',
    example: ['749', '85'],
  },
  {
    key: 'condition',
    label: 'Condition',
    required: true,
    aliases: ['item_condition', 'state'],
    hint: 'New, Like New, Good, Fair or Poor',
    example: ['Like New', 'Good'],
  },
  ...COMMON_CATEGORY_COLS,
  { key: 'brand', label: 'Brand', aliases: ['manufacturer', 'make'], hint: 'Up to 100 characters', example: ['Apple', 'Nike'] },
  { key: 'color', label: 'Color', aliases: ['colour'], hint: 'Up to 50 characters', example: ['Deep Purple', 'White'] },
  { key: 'quantity', label: 'Quantity', aliases: ['qty', 'stock', 'units'], hint: 'Whole number, 1 to 9,999 (default 1)', example: ['1', '2'] },
  { key: 'city', label: 'City', aliases: ['location', 'location_city', 'town'], hint: 'Defaults to your store location', example: ['Houston, TX', 'Houston, TX'] },
];

const VEHICLE_COLUMNS = [
  { key: 'year', label: 'Year', aliases: ['model_year', 'yr'], hint: '4-digit year', example: ['2021', ''] },
  { key: 'make', label: 'Make', aliases: ['manufacturer'], hint: 'Example: Toyota', example: ['Toyota', ''] },
  { key: 'model', label: 'Model', aliases: ['car_model'], hint: 'Example: Camry', example: ['Camry', ''] },
  {
    key: 'title',
    label: 'Title',
    aliases: ['name', 'listing_title', 'product_name'],
    hint: 'Required only for parts and accessories (otherwise built from year, make and model)',
    example: ['', 'Set of 4 All-Season Tires 225/55R17'],
  },
  {
    key: 'price',
    label: 'Price',
    required: true,
    aliases: ['price_usd', 'amount', 'asking_price', 'cost'],
    hint: 'Number in US dollars, greater than 0',
    example: ['21500', '380'],
  },
  {
    key: 'condition',
    label: 'Condition',
    required: true,
    aliases: ['vehicle_condition', 'item_condition'],
    hint: 'Vehicles: New, Certified Pre-Owned, Excellent, Good, Fair. Parts: New, Like New, Good, Fair, Poor',
    example: ['Good', 'New'],
  },
  { key: 'mileage', label: 'Mileage', recommended: true, aliases: ['miles', 'odometer'], hint: 'Number of miles', example: ['42000', ''] },
  { key: 'fuel_type', label: 'Fuel Type', recommended: true, aliases: ['fuel'], hint: 'Gasoline, Diesel, Electric, Hybrid, Plug-in Hybrid, Hydrogen', example: ['Gasoline', ''] },
  { key: 'transmission', label: 'Transmission', recommended: true, aliases: ['gearbox'], hint: 'Automatic, Manual or CVT', example: ['Automatic', ''] },
  { key: 'drivetrain', label: 'Drivetrain', aliases: ['drive', 'drive_type'], hint: 'FWD, RWD, AWD or 4WD', example: ['FWD', ''] },
  { key: 'body_type', label: 'Body Type', recommended: true, aliases: ['body', 'style', 'vehicle_type'], hint: 'Sedan, SUV, Truck, Coupe, Van, Wagon, Convertible, Hatchback, EV', example: ['Sedan', ''] },
  { key: 'engine_size', label: 'Engine Size', aliases: ['engine', 'engine_l'], hint: 'Example: 2.5', example: ['2.5', ''] },
  { key: 'color', label: 'Color', aliases: ['colour', 'exterior_color'], hint: 'Up to 50 characters', example: ['Silver', 'Black'] },
  { key: 'num_owners', label: 'Previous Owners', aliases: ['owners', 'previous_owners'], hint: 'Whole number', example: ['1', ''] },
  { key: 'title_status', label: 'Title Status', aliases: ['title_type'], hint: 'Clean, Salvage, Rebuilt, Flood, Lemon', example: ['Clean', ''] },
  { key: 'seller_type', label: 'Seller Type', aliases: ['sold_by'], hint: 'Private or Dealership', example: ['Dealership', 'Dealership'] },
  { key: 'vin', label: 'VIN', aliases: ['vin_number'], hint: '17 characters', example: ['', ''] },
  { key: 'registration_state', label: 'Registration State', aliases: ['state', 'reg_state'], hint: 'Example: TX', example: ['TX', ''] },
  { key: 'features', label: 'Features', aliases: ['options', 'feature_list'], hint: 'Separate with commas', example: ['A/C, Backup Camera, Bluetooth', ''] },
  { key: 'description', label: 'Description', recommended: true, aliases: ['details', 'desc'], hint: 'Up to 5,000 characters', example: ['One owner, clean Carfax.', 'Brand new in box.'] },
  { key: 'brand', label: 'Brand', aliases: ['part_brand'], hint: 'For parts and accessories', example: ['', 'Michelin'] },
  ...COMMON_CATEGORY_COLS,
  { key: 'city', label: 'City', aliases: ['location', 'location_city'], hint: 'Defaults to your store location', example: ['Houston, TX', 'Houston, TX'] },
];

const REAL_ESTATE_COLUMNS = [
  {
    key: 'intent',
    label: 'Listing Type',
    required: true,
    aliases: ['listing_type', 'purpose', 'for', 'sale_or_rent', 'type_of_listing'],
    hint: 'Sale, Rent, Lease (commercial) or Vacation',
    example: ['Sale', 'Rent'],
    group: 'Core',
  },
  {
    key: 'property_type',
    label: 'Property Type',
    required: true,
    aliases: ['property', 'type', 'home_type', 'propertytype'],
    hint: 'House, Townhouse, Condo, Apartment, Land, Office, Retail, ...',
    example: ['House', 'Apartment'],
    group: 'Core',
  },
  {
    key: 'price',
    label: 'Price',
    required: true,
    aliases: ['price_usd', 'rent', 'asking_price', 'amount', 'monthly_rent'],
    hint: 'Sale price, or monthly rent for rentals (USD)',
    example: ['485000', '2200'],
    group: 'Core',
  },
  { key: 'city', label: 'City', required: true, aliases: ['town', 'location_city'], hint: 'Example: Austin', example: ['Austin', 'Dallas'], group: 'Core' },
  { key: 'state', label: 'State', aliases: ['province', 'st'], hint: 'Example: TX', example: ['TX', 'TX'], group: 'Core' },
  { key: 'address', label: 'Street Address', aliases: ['street', 'street_address', 'full_address'], hint: 'Kept private unless you choose exact', example: ['123 Oak Street', '45 Elm Ave Apt 3B'], group: 'Core' },
  { key: 'address_visibility', label: 'Address Visibility', aliases: ['location_type', 'show_address'], hint: 'Approximate (default) or Exact', example: ['Approximate', 'Approximate'], group: 'Core' },
  { key: 'bedrooms', label: 'Bedrooms', recommended: true, aliases: ['beds', 'bed', 'bd'], hint: 'Number', example: ['4', '2'], group: 'Core' },
  { key: 'bathrooms', label: 'Bathrooms', recommended: true, aliases: ['baths', 'bath', 'ba'], hint: 'Number', example: ['3', '2'], group: 'Core' },
  { key: 'area_size', label: 'Size (sq ft)', recommended: true, aliases: ['sqft', 'square_feet', 'sq_ft', 'size', 'living_area'], hint: 'Square feet', example: ['2450', '1100'], group: 'Core' },
  { key: 'lot_size', label: 'Lot Size', aliases: ['lot'], hint: 'Example: 0.25 acres', example: ['0.25 acres', ''], group: 'Core' },
  { key: 'year_built', label: 'Year Built', aliases: ['construction_year', 'built'], hint: '4-digit year', example: ['2015', ''], group: 'Core' },
  { key: 'parking_spaces', label: 'Parking Spaces', aliases: ['parking', 'garage'], hint: 'Number', example: ['2', '1'], group: 'Core' },
  { key: 'description', label: 'Description', recommended: true, aliases: ['details', 'desc', 'property_description'], hint: 'Up to 5,000 characters', example: ['Updated kitchen, large backyard.', 'Walk to transit.'], group: 'Core' },
  { key: 'features', label: 'Features', aliases: ['amenities', 'feature_list'], hint: 'Separate with commas', example: ['Pool, Fireplace, Garage', 'Laundry, Gym'], group: 'Core' },
  ...COMMON_CATEGORY_COLS.map((c) => ({ ...c, group: 'Core' })),
  { key: 'hoa_fees', label: 'HOA Fees (per month)', aliases: ['hoa'], hint: 'For sale listings', example: ['120', ''], group: 'For Sale' },
  { key: 'property_taxes', label: 'Property Taxes (per year)', aliases: ['taxes', 'annual_taxes'], hint: 'For sale listings', example: ['6200', ''], group: 'For Sale' },
  { key: 'security_deposit', label: 'Security Deposit', aliases: ['deposit'], hint: 'Rent and vacation listings', example: ['', '2200'], group: 'For Rent' },
  { key: 'application_fee', label: 'Application Fee', aliases: ['app_fee'], hint: 'Rent listings', example: ['', '50'], group: 'For Rent' },
  { key: 'available_date', label: 'Available Date', aliases: ['available_from', 'move_in_date'], hint: 'Example: 2026-11-01', example: ['', '2026-11-01'], group: 'For Rent' },
  { key: 'lease_term', label: 'Lease Term', aliases: ['term'], hint: 'Example: 12 months', example: ['', '12 months'], group: 'For Rent' },
  { key: 'pet_policy', label: 'Pet Policy', aliases: ['pets'], hint: 'Example: Cats and small dogs', example: ['', 'Cats allowed'], group: 'For Rent' },
  { key: 'smoking_policy', label: 'Smoking Policy', aliases: ['smoking'], hint: 'Example: No smoking', example: ['', 'No smoking'], group: 'For Rent' },
  { key: 'utilities_included', label: 'Utilities Included', aliases: ['utilities'], hint: 'Separate with commas', example: ['', 'Water, Trash'], group: 'For Rent' },
  { key: 'available_space', label: 'Available Space (sq ft)', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'min_lease_term', label: 'Min Lease Term (years)', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'max_lease_term', label: 'Max Lease Term (years)', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'building_size', label: 'Building Size (sq ft)', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'ceiling_height', label: 'Ceiling Height (ft)', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'zoning', label: 'Zoning', aliases: [], hint: 'Land and commercial', example: ['', ''], group: 'For Lease' },
  { key: 'cam_nnn', label: 'CAM / NNN', aliases: [], hint: 'Commercial lease', example: ['', ''], group: 'For Lease' },
  { key: 'weekend_rate', label: 'Weekend Rate', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'cleaning_fee', label: 'Cleaning Fee', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'min_stay', label: 'Min Stay (nights)', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'max_guests', label: 'Max Guests', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'check_in_time', label: 'Check-In Time', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'check_out_time', label: 'Check-Out Time', aliases: [], hint: 'Vacation rentals', example: ['', ''], group: 'Vacation' },
  { key: 'acreage', label: 'Acreage', aliases: ['acres'], hint: 'Land listings', example: ['', ''], group: 'Land' },
  { key: 'road_access', label: 'Road Access', aliases: [], hint: 'Land listings', example: ['', ''], group: 'Land' },
  { key: 'water', label: 'Water', aliases: [], hint: 'Land listings', example: ['', ''], group: 'Land' },
  { key: 'sewer', label: 'Sewer', aliases: [], hint: 'Land listings', example: ['', ''], group: 'Land' },
  { key: 'electricity', label: 'Electricity', aliases: [], hint: 'Land listings', example: ['', ''], group: 'Land' },
];

export const BULK_COLUMNS = {
  [BULK_TYPES.ESSENTIALS]: ESSENTIALS_COLUMNS,
  [BULK_TYPES.VEHICLES]: VEHICLE_COLUMNS,
  [BULK_TYPES.REAL_ESTATE]: REAL_ESTATE_COLUMNS,
};

// ─────────────────────────────────────────────────────────────
// Generic helpers
// ─────────────────────────────────────────────────────────────
export function normalizeHeader(h) {
  return String(h ?? '')
    .toLowerCase()
    .replace(/\*/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const squash = (v) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const s = (v) => (v === undefined || v === null ? '' : String(v).trim());

/** Parse a number from text such as "$1,250.50". Returns undefined if blank, NaN if invalid. */
export function parseNumber(v) {
  const t = s(v).replace(/[$,\s]/g, '');
  if (t === '') return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Match a free-text value against [{value,label}] options.
 * Returns the option or null.
 */
export function matchOption(raw, options, synonyms = {}) {
  const key = squash(raw);
  if (!key) return null;
  if (synonyms[key]) {
    const hit = options.find((o) => o.value === synonyms[key]);
    if (hit) return hit;
  }
  const exact = options.find((o) => squash(o.value) === key || squash(o.label) === key);
  if (exact) return exact;
  if (key.length >= 3) {
    const starts = options.find((o) => squash(o.label).startsWith(key) || squash(o.value).startsWith(key));
    if (starts) return starts;
  }
  return null;
}

const FUEL_SYN = { gas: 'gasoline', petrol: 'gasoline', ev: 'electric', phev: 'plugin_hybrid', fuelcell: 'hydrogen' };
const TRANS_SYN = { auto: 'automatic', stick: 'manual', standard: 'manual' };
const BODY_SYN = { pickup: 'truck', pickuptruck: 'truck', minivan: 'van', crossover: 'suv', sportscar: 'coupe', electric: 'ev', sportutility: 'suv' };
const DRIVE_SYN = { fwd: 'fwd', frontwheeldrive: 'fwd', rearwheeldrive: 'rwd', allwheeldrive: 'awd', fourwheeldrive: '4wd', '4x4': '4wd' };

// Condition tokens: new | certified | excellent | good | fair | poor
export function normalizeConditionToken(raw) {
  const k = squash(raw);
  if (!k) return null;
  if (['new', 'brandnew', 'sealed', 'unused'].includes(k)) return 'new';
  if (['certified', 'certifiedpreowned', 'cpo', 'preowned'].includes(k)) return 'certified';
  if (['likenew', 'excellent', 'usedexcellent', 'mint', 'likenewcondition'].includes(k)) return 'excellent';
  if (['good', 'usedgood', 'used', 'refurbished', 'verygood', 'preloved'].includes(k)) return 'good';
  if (['fair', 'usedfair', 'acceptable', 'worn'].includes(k)) return 'fair';
  if (['poor', 'forparts', 'forpartsorrepair', 'forpartsrepair', 'parts', 'repair', 'damaged', 'salvage'].includes(k)) return 'poor';
  return null;
}

const ITEM_CONDITION_MAP = { new: 'new', certified: 'like_new', excellent: 'like_new', good: 'good', fair: 'fair', poor: 'poor' };
const VEHICLE_CONDITION_MAP = { new: 'new', certified: 'like_new', excellent: 'good', good: 'good', fair: 'good', poor: 'good' };

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'For Parts / Repair',
};

const splitList = (v) =>
  s(v)
    .split(/[;,|]/)
    .map((x) => x.trim())
    .filter(Boolean);

// ─────────────────────────────────────────────────────────────
// Header recognition
// ─────────────────────────────────────────────────────────────

/**
 * Map raw sheet headers to canonical column keys.
 * @returns {{ indexToKey: Object, recognized: Array, ignored: string[], missing: Array<{key,label,message}> }}
 */
export function mapHeaders(rawHeaders, type) {
  const columns = BULK_COLUMNS[type] || [];
  const lookup = new Map();
  columns.forEach((c) => {
    lookup.set(normalizeHeader(c.key), c.key);
    lookup.set(normalizeHeader(c.label), c.key);
    (c.aliases || []).forEach((a) => lookup.set(normalizeHeader(a), c.key));
  });

  const indexToKey = {};
  const seen = new Set();
  const recognized = [];
  const ignored = [];

  rawHeaders.forEach((h, idx) => {
    const text = s(h);
    if (!text) return;
    const key = lookup.get(normalizeHeader(text));
    if (key && !seen.has(key)) {
      seen.add(key);
      indexToKey[idx] = key;
      recognized.push({ header: text, key });
    } else {
      ignored.push(text);
    }
  });

  const missing = [];
  const need = (key, message) => {
    if (!seen.has(key)) {
      const col = columns.find((c) => c.key === key);
      missing.push({ key, label: col?.label || key, message: message || `${col?.label || key} column is required` });
    }
  };

  if (type === BULK_TYPES.ESSENTIALS) {
    need('title');
    need('price');
    need('condition');
  } else if (type === BULK_TYPES.VEHICLES) {
    if (!seen.has('title')) {
      ['year', 'make', 'model'].forEach((k) =>
        need(k, `${columns.find((c) => c.key === k).label} column is required (or add a Title column for parts and accessories)`)
      );
    }
    need('price');
    need('condition');
  } else if (type === BULK_TYPES.REAL_ESTATE) {
    need('intent');
    need('property_type');
    need('price');
    need('city');
  }

  return { indexToKey, recognized, ignored, missing };
}

// ─────────────────────────────────────────────────────────────
// Row builders
// ─────────────────────────────────────────────────────────────

function checkLen(value, max, label, errors) {
  if (value && value.length > max) errors.push(`${label} must be ${max} characters or fewer`);
}

function checkNumberField(row, key, label, errors, { min, max, integer } = {}) {
  const n = parseNumber(row[key]);
  if (n === undefined) return undefined;
  if (Number.isNaN(n)) {
    errors.push(`${label} must be a number`);
    return undefined;
  }
  if (integer && !Number.isInteger(n)) errors.push(`${label} must be a whole number`);
  if (min !== undefined && n < min) errors.push(`${label} must be at least ${min}`);
  if (max !== undefined && n > max) errors.push(`${label} must be ${max} or less`);
  return n;
}

function resolveLocation(row, ctx, { exact } = {}) {
  const { store, user = {} } = ctx;
  const isQuick = store?.description === 'Personal listings';
  const userCity = [user.city, user.state].filter(Boolean).join(', ');
  const city = s(row.city) || (isQuick ? userCity : store?.location_city) || userCity || '';

  let lat;
  let lng;
  if (isQuick) {
    if (user.lat && user.lng) {
      if (exact) {
        lat = user.lat;
        lng = user.lng;
      } else {
        // Same ~10 mile privacy offset the single-listing forms apply for quick listings.
        const r = 10 / 69.172;
        const w = r * Math.sqrt(Math.random());
        const t = 2 * Math.PI * Math.random();
        lat = user.lat + w * Math.sin(t);
        lng = user.lng + (w * Math.cos(t)) / Math.cos((user.lat * Math.PI) / 180);
      }
    }
  } else {
    lat = store?.location_lat ?? user.lat ?? undefined;
    lng = store?.location_lng ?? user.lng ?? undefined;
  }
  return { city, lat: lat || undefined, lng: lng || undefined };
}

function basePayload({ title, description, price, condition, brand, color, quantity, location, status }) {
  const p = {
    title,
    description: description || '',
    price,
    condition,
    quantity: quantity || 1,
    location_city: location.city,
    status: status || 'available',
    currency: 'USD',
  };
  if (brand) p.brand = brand;
  if (color) p.color = color;
  if (location.lat) p.location_lat = location.lat;
  if (location.lng) p.location_lng = location.lng;
  return p;
}

// ── Marketplace ──────────────────────────────────────────────
function buildEssentials(row, ctx) {
  const errors = [];
  const warnings = [];

  const title = s(row.title);
  if (!title) errors.push('Title is required');
  else if (title.length < 3) errors.push('Title must be at least 3 characters');
  checkLen(title, 200, 'Title', errors);

  const price = checkNumberField(row, 'price', 'Price', errors, { max: 999999999 });
  if (price === undefined && !errors.some((e) => e.startsWith('Price'))) errors.push('Price is required');
  else if (price !== undefined && price <= 0) errors.push('Price must be greater than 0');

  const token = normalizeConditionToken(row.condition);
  if (!s(row.condition)) errors.push('Condition is required');
  else if (!token) errors.push(`Condition "${row.condition}" is not valid. Use New, Like New, Good, Fair or Poor`);

  const quantity = checkNumberField(row, 'quantity', 'Quantity', errors, { min: 1, max: 9999, integer: true });
  const description = s(row.description);
  checkLen(description, 5000, 'Description', errors);
  if (!description) warnings.push('No description. Listings with a description get more views');
  const brand = s(row.brand);
  const color = s(row.color);
  checkLen(brand, 100, 'Brand', errors);
  checkLen(color, 50, 'Color', errors);
  checkLen(s(row.city), 100, 'City', errors);

  const condition = ITEM_CONDITION_MAP[token] || 'good';
  const location = resolveLocation(row, ctx);

  return {
    errors,
    warnings,
    payload: basePayload({
      title,
      description,
      price,
      condition,
      brand,
      color,
      quantity,
      location,
      status: ctx.status,
    }),
    display: {
      title,
      price,
      conditionLabel: CONDITION_LABELS[condition],
      subtitle: [brand, color, quantity && quantity > 1 ? `Qty ${quantity}` : ''].filter(Boolean).join(' · '),
    },
    categoryText: { primary: [title, brand].filter(Boolean).join(' '), secondary: description },
  };
}

// ── Automotive ───────────────────────────────────────────────
function enumValue(raw, options, synonyms, label, warnings) {
  const v = s(raw);
  if (!v) return { label: '', value: '' };
  const hit = matchOption(v, options, synonyms);
  if (hit) return { label: hit.label, value: hit.value };
  warnings.push(`${label} "${v}" is not a standard option. It will be listed as typed`);
  return { label: v, value: v };
}

function buildVehicles(row, ctx) {
  const errors = [];
  const warnings = [];

  const year = s(row.year);
  const make = s(row.make);
  const model = s(row.model);
  const hasVehicleCore = !!(year && make && model);
  const isAccessory = !hasVehicleCore && !!s(row.title);

  if (!hasVehicleCore && !isAccessory) {
    const missing = [!year && 'Year', !make && 'Make', !model && 'Model'].filter(Boolean).join(', ');
    errors.push(`${missing} required (or add a Title for parts and accessories)`);
  }

  if (year) {
    const y = Number(year);
    const maxYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(y) || y < 1900 || y > maxYear) errors.push(`Year must be between 1900 and ${maxYear}`);
  }

  const title = isAccessory ? s(row.title) : `${year} ${make} ${model}`.trim();
  if (title && title.length < 3) errors.push('Title must be at least 3 characters');
  checkLen(title, 200, 'Title', errors);

  const price = checkNumberField(row, 'price', 'Price', errors, { max: 999999999 });
  if (price === undefined && !errors.some((e) => e.startsWith('Price'))) errors.push('Price is required');
  else if (price !== undefined && price <= 0) errors.push('Price must be greater than 0');

  const token = normalizeConditionToken(row.condition);
  if (!s(row.condition)) errors.push('Condition is required');
  else if (!token) errors.push(`Condition "${row.condition}" is not valid`);

  const mileage = checkNumberField(row, 'mileage', 'Mileage', errors, { min: 0 });
  const owners = checkNumberField(row, 'num_owners', 'Previous Owners', errors, { min: 0, integer: true });
  checkLen(s(row.color), 50, 'Color', errors);
  checkLen(s(row.city), 100, 'City', errors);

  const fuel = enumValue(row.fuel_type, VEHICLE_FUEL_TYPES, FUEL_SYN, 'Fuel type', warnings);
  const trans = enumValue(row.transmission, VEHICLE_TRANSMISSIONS, TRANS_SYN, 'Transmission', warnings);
  const drive = enumValue(row.drivetrain, VEHICLE_DRIVETRAINS, DRIVE_SYN, 'Drivetrain', warnings);
  const body = enumValue(row.body_type, VEHICLE_BODY_TYPES, BODY_SYN, 'Body type', warnings);
  const titleStatus = enumValue(row.title_status, VEHICLE_TITLE_STATUS, {}, 'Title status', warnings);
  const sellerType = enumValue(row.seller_type, VEHICLE_SELLER_TYPE, { dealer: 'dealership' }, 'Seller type', warnings);

  const vin = s(row.vin).toUpperCase();
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) warnings.push('VIN should be 17 characters (no I, O or Q)');

  const engine = s(row.engine_size);
  const features = splitList(row.features);
  const userDescription = s(row.description);

  let description;
  if (isAccessory) {
    description = userDescription;
  } else {
    description = [
      `Make: ${make}`,
      `Model: ${model}`,
      `Year: ${year}`,
      mileage !== undefined && `Mileage: ${mileage} miles`,
      fuel.label && `Fuel: ${fuel.label}`,
      trans.label && `Transmission: ${trans.label}`,
      drive.label && `Drivetrain: ${drive.label}`,
      body.label && `Body: ${body.label}`,
      engine && `Engine: ${engine}${/^\d+(\.\d+)?$/.test(engine) ? 'L' : ''}`,
      s(row.color) && `Color: ${s(row.color)}`,
      owners !== undefined && `Previous Owners: ${owners}`,
      titleStatus.label && `Title Status: ${titleStatus.label}`,
      sellerType.label && `Seller: ${sellerType.label}`,
      vin && `VIN: ${vin}`,
      s(row.registration_state) && `Registration: ${s(row.registration_state)}`,
      features.length > 0 && `\nFeatures: ${features.join(', ')}`,
      userDescription && `\n${userDescription}`,
    ]
      .filter(Boolean)
      .join('\n');
  }
  checkLen(description, 5000, 'Description', errors);
  if (!userDescription && isAccessory) warnings.push('No description. Listings with a description get more views');

  const map = isAccessory ? ITEM_CONDITION_MAP : VEHICLE_CONDITION_MAP;
  const condition = map[token] || 'good';
  const brand = isAccessory ? s(row.brand) : make;
  checkLen(brand, 100, 'Brand', errors);

  const location = resolveLocation(row, ctx);

  return {
    errors,
    warnings,
    payload: basePayload({
      title,
      description,
      price,
      condition,
      brand,
      color: s(row.color),
      quantity: 1,
      location,
      status: ctx.status,
    }),
    display: {
      title,
      price,
      conditionLabel: token ? { new: 'New', certified: 'Certified Pre-Owned', excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'For Parts / Repair' }[token] : '',
      subtitle: isAccessory
        ? [brand, 'Part / Accessory'].filter(Boolean).join(' · ')
        : [mileage !== undefined && `${Number(mileage).toLocaleString('en-US')} mi`, fuel.label, trans.label, body.label]
            .filter(Boolean)
            .join(' · '),
    },
    categoryText: {
      primary: [title, isAccessory ? brand : '', body.label, s(row.body_type)].filter(Boolean).join(' '),
      secondary: userDescription,
    },
    vehicleHints: { isAccessory, bodyValue: body.value, fuelValue: fuel.value },
  };
}

// ── Real estate ──────────────────────────────────────────────
const usd = (v) => `$${v}`;
const RE_DETAIL_FIELDS = {
  land: [
    ['acreage', 'Acreage', (v) => `${v} acres`],
    ['lot_size', 'Lot Size'],
    ['zoning', 'Zoning'],
    ['road_access', 'Road Access'],
    ['water', 'Water'],
    ['sewer', 'Sewer'],
    ['electricity', 'Electricity'],
  ],
  rent: [
    ['security_deposit', 'Security Deposit', usd],
    ['application_fee', 'Application Fee', usd],
    ['available_date', 'Available Date'],
    ['lease_term', 'Lease Term'],
    ['bedrooms', 'Bedrooms'],
    ['bathrooms', 'Bathrooms'],
    ['area_size', 'Size', (v) => `${v} sqft`],
    ['pet_policy', 'Pet Policy'],
    ['smoking_policy', 'Smoking'],
    ['utilities_included', 'Utilities Included', (v) => splitList(v).join(', ')],
  ],
  lease: [
    ['available_space', 'Available Space', (v) => `${v} sqft`],
    ['min_lease_term', 'Min Lease Term', (v) => `${v} years`],
    ['max_lease_term', 'Max Lease Term', (v) => `${v} years`],
    ['available_date', 'Available Date'],
    ['building_size', 'Building Size', (v) => `${v} sqft`],
    ['ceiling_height', 'Ceiling Height', (v) => `${v} ft`],
    ['parking_spaces', 'Parking Spaces'],
    ['zoning', 'Zoning'],
    ['cam_nnn', 'CAM/NNN'],
  ],
  vacation: [
    ['weekend_rate', 'Weekend Rate', usd],
    ['cleaning_fee', 'Cleaning Fee', usd],
    ['security_deposit', 'Security Deposit', usd],
    ['min_stay', 'Min Stay', (v) => `${v} nights`],
    ['max_guests', 'Max Guests'],
    ['bedrooms', 'Bedrooms'],
    ['bathrooms', 'Bathrooms'],
    ['check_in_time', 'Check-In'],
    ['check_out_time', 'Check-Out'],
  ],
  sale: [
    ['bedrooms', 'Bedrooms'],
    ['bathrooms', 'Bathrooms'],
    ['area_size', 'Size', (v) => `${v} sqft`],
    ['lot_size', 'Lot Size'],
    ['year_built', 'Year Built'],
    ['parking_spaces', 'Parking Spaces'],
    ['hoa_fees', 'HOA Fees', (v) => `$${v}/month`],
    ['property_taxes', 'Property Taxes', (v) => `$${v}/year`],
  ],
};

const RE_NUMERIC_KEYS = [
  ['bedrooms', 'Bedrooms', { min: 0 }],
  ['bathrooms', 'Bathrooms', { min: 0 }],
  ['area_size', 'Size', { min: 0 }],
  ['year_built', 'Year Built', { min: 1600, max: new Date().getFullYear() + 2, integer: true }],
  ['parking_spaces', 'Parking Spaces', { min: 0 }],
  ['acreage', 'Acreage', { min: 0 }],
  ['hoa_fees', 'HOA Fees', { min: 0 }],
  ['property_taxes', 'Property Taxes', { min: 0 }],
  ['security_deposit', 'Security Deposit', { min: 0 }],
  ['application_fee', 'Application Fee', { min: 0 }],
  ['cleaning_fee', 'Cleaning Fee', { min: 0 }],
  ['weekend_rate', 'Weekend Rate', { min: 0 }],
  ['min_stay', 'Min Stay', { min: 0 }],
  ['max_guests', 'Max Guests', { min: 0 }],
];

export function resolveIntent(raw) {
  const k = squash(raw);
  if (!k) return null;
  return (
    RE_INTENTS.find(
      (i) => squash(i.value) === k || squash(i.label) === k || i.aliases.some((a) => squash(a) === k)
    ) || null
  );
}

function buildRealEstate(row, ctx) {
  const errors = [];
  const warnings = [];

  const intentOpt = resolveIntent(row.intent);
  if (!s(row.intent)) errors.push('Listing Type is required (Sale, Rent, Lease or Vacation)');
  else if (!intentOpt) errors.push(`Listing Type "${row.intent}" is not valid. Use Sale, Rent, Lease or Vacation`);
  const intent = intentOpt?.value;

  let typeOpt = null;
  if (!s(row.property_type)) errors.push('Property Type is required');
  else if (intent) {
    const options = RE_TYPES_BY_INTENT[intent];
    typeOpt = matchOption(row.property_type, options, RE_TYPE_SYNONYMS);
    if (!typeOpt) {
      errors.push(
        `Property Type "${row.property_type}" is not available for ${intentOpt.label}. Options: ${options.map((o) => o.label).join(', ')}`
      );
    }
  }
  const propertyType = typeOpt?.value;
  const isLand = propertyType === 'land';

  const price = checkNumberField(row, 'price', 'Price', errors, { max: 999999999 });
  if (price === undefined && !errors.some((e) => e.startsWith('Price'))) errors.push('Price is required');
  else if (price !== undefined && price <= 0) errors.push('Price must be greater than 0');

  const city = s(row.city);
  if (!city) errors.push('City is required');
  checkLen(city, 100, 'City', errors);

  const num = {};
  RE_NUMERIC_KEYS.forEach(([key, label, opts]) => {
    num[key] = checkNumberField(row, key, label, errors, opts);
  });

  const visibilityRaw = squash(row.address_visibility);
  const exact = ['exact', 'public', 'show', 'yes', 'visible'].includes(visibilityRaw);
  const visibility = exact ? 'exact' : 'approximate';
  if (visibilityRaw && !exact && !['approximate', 'approx', 'hidden', 'private', 'no', 'hide'].includes(visibilityRaw)) {
    warnings.push(`Address Visibility "${row.address_visibility}" not recognized. Using approximate`);
  }

  const propLabel = REAL_ESTATE_TYPES.find((t) => t.value === propertyType)?.label || typeOpt?.label || 'Property';
  const purposeLabel = intentOpt?.label || '';

  // Title (same wording rules as the single-listing form)
  let title = '';
  if (intent && propertyType) {
    if (isLand) {
      const acre = num.acreage !== undefined ? `${num.acreage} Acre ` : '';
      title = `${acre}Land ${purposeLabel} in ${city}`;
    } else if (intent === 'vacation') {
      title = `${num.bedrooms !== undefined ? `${num.bedrooms} Bed ` : ''}${propLabel} Vacation Rental in ${city}`;
    } else if (intent === 'lease') {
      title = `${num.area_size !== undefined ? `${num.area_size} SF ` : ''}${propLabel || 'Commercial Space'} ${purposeLabel} in ${city}`;
    } else {
      const beds = num.bedrooms !== undefined ? `${num.bedrooms} Bd` : '';
      const baths = num.bathrooms !== undefined ? ` / ${num.bathrooms} Ba` : '';
      title = `${propLabel} ${purposeLabel} — ${beds}${baths} in ${city}`;
    }
  }
  title = title.slice(0, 200);

  // Details (same tag format the property pages parse)
  const details = [`[Intent]: ${intent || ''}`, `[Property_Type]: ${propertyType || ''}`];
  const fieldKey = isLand ? 'land' : intent;
  (RE_DETAIL_FIELDS[fieldKey] || []).forEach(([key, label, fmt]) => {
    const raw = s(row[key]);
    if (raw === '') return;
    const value = num[key] !== undefined ? num[key] : raw;
    details.push(`${label}: ${fmt ? fmt(value) : value}`);
  });

  const features = splitList(row.features);
  if (features.length > 0) details.push(`Features: ${features.join(', ')}`);

  const userDescription = s(row.description);
  if (userDescription) details.push(`\nDescription:\n${userDescription}`);

  const location = resolveLocation({ ...row, city: [city, s(row.state)].filter(Boolean).join(', ') }, ctx, { exact });
  const privateLat = ctx.store?.location_lat ?? ctx.user?.lat ?? '';
  const privateLng = ctx.store?.location_lng ?? ctx.user?.lng ?? '';
  details.push(`\n[Private_Address]: ${s(row.address)}`);
  details.push(`[Private_Lat]: ${privateLat}`);
  details.push(`[Private_Lng]: ${privateLng}`);
  details.push(`[Address_Visibility]: ${visibility}`);

  const description = details.join('\n');
  checkLen(description, 5000, 'Description', errors);
  if (!userDescription) warnings.push('No description. Listings with a description get more views');

  return {
    errors,
    warnings,
    payload: basePayload({
      title,
      description,
      price,
      condition: 'good',
      quantity: 1,
      location,
      status: ctx.status,
    }),
    display: {
      title,
      price,
      conditionLabel: intentOpt ? intentOpt.label : '',
      subtitle: [
        num.bedrooms !== undefined && `${num.bedrooms} bd`,
        num.bathrooms !== undefined && `${num.bathrooms} ba`,
        num.area_size !== undefined && `${Number(num.area_size).toLocaleString('en-US')} sqft`,
        propLabel,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    categoryText: { primary: title, secondary: '' },
    realEstateHints: { intent, propertyType },
  };
}

/**
 * Build and validate one listing from a normalized row object.
 * @param {Object} row    keys are canonical column keys, values are strings
 * @param {string} type   one of BULK_TYPES
 * @param {Object} ctx    { store, user: {lat,lng,city,state}, status }
 */
export function buildListing(row, type, ctx = {}) {
  if (type === BULK_TYPES.VEHICLES) return buildVehicles(row, ctx);
  if (type === BULK_TYPES.REAL_ESTATE) return buildRealEstate(row, ctx);
  return buildEssentials(row, ctx);
}
