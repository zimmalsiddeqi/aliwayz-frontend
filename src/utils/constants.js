// ─────────────────────────────────────────
// App constants — mirrors backend constants
// ─────────────────────────────────────────

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Aliwayz';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aliwayz-backend-production-1899.up.railway.app/api/v1';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://aliwayz-backend-production-1899.up.railway.app';

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
  { value: 'new',       label: 'Brand New' },
  { value: 'like_new',  label: 'Like New' },
  { value: 'good',      label: 'Good' },
  { value: 'fair',      label: 'Fair' },
  { value: 'poor',      label: 'For Parts / Repair' },
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
    name:        'Marketplace',
    emoji:       '🛒',
    gradient:    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    description: 'Electronics, fashion, home goods & everything else',
    color:       '#8B5CF6',
  },
  {
    id:          MAIN_CATEGORIES.VEHICLES,
    name:        'Automotive',
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

export const VEHICLE_MODELS = {
  'Acura': ['Integra', 'TLX', 'ADX', 'RDX', 'MDX', 'ZDX', 'NSX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', '4C'],
  'Aston Martin': ['DB11', 'DB12', 'DBS', 'Vantage', 'Vanquish', 'DBX', 'Valkyrie'],
  'Audi': [
    'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8',
    'e-tron GT', 'R8', 'RS3', 'RS5', 'RS6', 'RS7', 'RS Q8'
  ],
  'Bentley': ['Continental GT', 'Continental GTC', 'Flying Spur', 'Bentayga'],
  'BMW': [
    '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series',
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM',
    'i3', 'i4', 'i5', 'i7', 'iX', 'iX3', 'Z4',
    'M2', 'M3', 'M4', 'M5', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M'
  ],
  'Bugatti': ['Chiron', 'Veyron', 'Tourbillon', 'Divo', 'Centodieci', 'Mistral', 'Bolide'],
  'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave'],
  'Cadillac': [
    'CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6',
    'Escalade', 'Escalade ESV', 'Lyriq', 'Optiq', 'Vistiq', 'Celestiq'
  ],
  'Chevrolet': [
    'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe',
    'Suburban', 'Colorado', 'Silverado 1500', 'Silverado 2500HD',
    'Silverado 3500HD', 'Corvette', 'Camaro', 'Malibu', 'Bolt EV',
    'Bolt EUV', 'Equinox EV', 'Blazer EV', 'Silverado EV'
  ],
  'Chrysler': ['300', 'Pacifica', 'Pacifica Hybrid', 'Voyager'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'Hornet', 'Journey', 'Grand Caravan'],
  'Ferrari': [
    '296 GTB', '296 GTS', 'Roma', 'Roma Spider', 'Purosangue',
    'SF90 Stradale', 'SF90 Spider', '12Cilindri', '12Cilindri Spider'
  ],
  'Ford': [
    'Bronco', 'Bronco Sport', 'Escape', 'Explorer', 'Expedition',
    'Mustang', 'Mustang Mach-E', 'Maverick', 'Ranger', 'F-150',
    'Super Duty F-250', 'Super Duty F-350', 'Super Duty F-450',
    'Transit', 'Transit Connect'
  ],
  'Genesis': [
    'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80',
    'Electrified G80', 'Electrified GV70'
  ],
  'GMC': [
    'Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Canyon',
    'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD',
    'Hummer EV Pickup', 'Hummer EV SUV'
  ],
  'Honda': [
    'Civic', 'Accord', 'Insight', 'HR-V', 'CR-V', 'Passport', 'Pilot',
    'Ridgeline', 'Odyssey', 'Prologue', 'Civic Type R'
  ],
  'Hyundai': [
    'Elantra', 'Sonata', 'Accent', 'Venue', 'Kona', 'Tucson', 'Santa Fe',
    'Palisade', 'Ioniq 5', 'Ioniq 6', 'Ioniq 9', 'Santa Cruz', 'Veloster'
  ],
  'Infiniti': ['Q50', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Jaguar': ['F-Pace', 'E-Pace', 'F-Type', 'XE', 'XF', 'XJ', 'I-Pace'],
  'Jeep': [
    'Wrangler', 'Wrangler 4xe', 'Grand Cherokee', 'Grand Cherokee 4xe',
    'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer',
    'Grand Wagoneer', 'Wagoneer S'
  ],
  'Kia': [
    'Forte', 'K4', 'K5', 'Rio', 'Soul', 'Seltos', 'Sportage', 'Sorento',
    'Telluride', 'Carnival', 'EV6', 'EV9', 'Niro', 'Stinger'
  ],
  'Lamborghini': ['Revuelto', 'Temerario', 'Urus', 'Urus S', 'Urus Performante', 'Urus SE'],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Range Rover',
    'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque'
  ],
  'Lexus': [
    'IS', 'ES', 'LS', 'RC', 'LC', 'UX', 'NX', 'RX', 'TX', 'GX', 'LX', 'RZ'
  ],
  'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator', 'Navigator L'],
  'Maserati': [
    'Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'GranTurismo',
    'GranCabrio', 'MC20', 'MC20 Cielo'
  ],
  'Mazda': [
    'Mazda3', 'Mazda6', 'CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90',
    'MX-5 Miata', 'MX-30'
  ],
  'McLaren': [
    'Artura', '570S', '600LT', '720S', '750S', '765LT', '7900',
    'GT', 'Senna', 'Speedtail'
  ],
  'Mercedes-Benz': [
    'A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLE', 'CLS',
    'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class',
    'EQB', 'EQE', 'EQS', 'EQE SUV', 'EQS SUV', 'AMG GT', 'SL'
  ],
  'Mini': ['Cooper', 'Countryman', 'Clubman'],
  'Mitsubishi': ['Mirage', 'Mirage G4', 'Outlander', 'Outlander Sport', 'Eclipse Cross'],
  'Nissan': [
    'Versa', 'Sentra', 'Altima', 'Maxima', 'Kicks', 'Rogue', 'Murano',
    'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Z', 'GT-R', 'Ariya'
  ],
  'Polestar': ['Polestar 2', 'Polestar 3', 'Polestar 4', 'Polestar 5', 'Polestar 6'],
  'Porsche': [
    '718 Boxster', '718 Cayman', '911', 'Taycan', 'Panamera', 'Macan', 'Cayenne'
  ],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'Rimac': ['Nevera'],
  'Rivian': ['R1T', 'R1S', 'R2', 'R3', 'R3X'],
  'Rolls-Royce': [
    'Ghost', 'Phantom', 'Phantom Extended', 'Cullinan', 'Spectre', 'Dawn', 'Wraith'
  ],
  'Subaru': [
    'Impreza', 'Legacy', 'WRX', 'BRZ', 'Crosstrek', 'Forester', 'Outback',
    'Ascent', 'Solterra'
  ],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
  'Toyota': [
    'Corolla', 'Camry', 'Prius', 'Crown', 'GR86', 'GR Corolla', 'GR Supra',
    'RAV4', 'Highlander', 'Grand Highlander', '4Runner', 'Sequoia',
    'Land Cruiser', 'Tacoma', 'Tundra', 'Sienna', 'Venza', 'bZ4X'
  ],
  'Volkswagen': [
    'Jetta', 'Passat', 'Golf', 'Golf GTI', 'Golf R', 'Taos', 'Tiguan',
    'Atlas', 'Atlas Cross Sport', 'ID.4', 'ID. Buzz'
  ],
  'Volvo': [
    'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90',
    'EX30', 'EX40', 'EX90', 'EM90'
  ],
};

export const VEHICLE_MAKES = [
  ...Object.keys(VEHICLE_MODELS).sort((a, b) => a.localeCompare(b)),
  'Other',
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
  { value: 'gasoline',       label: 'Gasoline' },
  { value: 'diesel',         label: 'Diesel' },
  { value: 'electric',       label: 'Electric (EV)' },
  { value: 'hybrid',         label: 'Hybrid (Gasoline + Electric)' },
  { value: 'plugin_hybrid',  label: 'Plug-in Hybrid (PHEV)' },
  { value: 'hydrogen',       label: 'Hydrogen / Fuel Cell' },
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
  // New Main categories
  ELECTRONICS:              '287694ab-257a-553d-adbc-a75df1715d7d',
  VEHICLES:                 'eb4a3db3-bde6-55f3-b018-5533831eed3e',
  AUTOMOTIVE:               'eb4a3db3-bde6-55f3-b018-5533831eed3e', // Alias for Vehicles
  AUTO_PARTS_ACCESSORIES:   '9d4d190c-3f8d-539f-9c11-5754fa54a6d0',
  HOME_FURNITURE:           'a8c368d7-585d-50c6-980b-7421018c4d3d',
  FASHION:                  '5306363d-6580-5c73-ba72-4e64b31088f0',
  SHOES:                    'd2c45247-5679-5de4-9a71-8c88d364bf42',
  JEWELRY_WATCHES:          '4698c01b-e055-591a-a325-f0e4142df7b5',
  BEAUTY_PERSONAL_CARE:     '789f749b-ab2e-53d0-a913-aa4d572b77d7',
  BABY_KIDS:                'a1a5a10a-5c35-5d9b-b193-ab7f6b007683',
  TOYS_GAMES:               '42132243-e6bb-5f03-b0c0-7e40bec480e6',
  SPORTS_OUTDOORS:          'c1bc1b6e-fa80-55e6-87f1-293d2004ca8b',
  COLLECTIBLES_MEMORABILIA: 'ecc38186-251f-5139-b5e7-21ddbb01f980',
  BOOKS_MOVIES_MUSIC:       '3168c560-910f-5140-bfeb-cb6fefb22122',
  HOBBIES_CRAFTS:           '94c3f3a1-fb11-5f7d-b08f-fd10c975a8eb',
  MUSICAL_INSTRUMENTS:      '25fef732-bb26-539b-af6d-0c174872ba1d',
  PET_SUPPLIES:             'e7633c00-d1d6-5ef1-9bf5-cf51b978234a',
  TOOLS_EQUIPMENT:          '6658eeed-8ef5-597e-a241-99415dfb0377',
  APPLIANCES:               '7a0a1bde-076c-552e-a879-14f099379be3',
  GARDEN_OUTDOOR:           'b02e7a5a-ffd5-5193-b9ab-55b59ff16d97',
  COMPUTERS_OFFICE:         'fb4d57ce-b69c-5bf7-a426-b161d11cc2fd',
  HANDMADE:                 '20443dfd-5668-5ed0-95cf-fca7f51c539b',
  ANTIQUES_VINTAGE:         '8a446257-f0f0-5da2-b3b6-cdc666c0012b',
  BUSINESS_COMMERCIAL:      '6046a237-9184-5533-a51f-ff690d9adf2b',
  REAL_ESTATE:              '74a77684-6cca-52dd-acbd-05d08d9ffa67',
  PROPERTY:                 '74a77684-6cca-52dd-acbd-05d08d9ffa67', // Alias for Real Estate
  FREE_GIVEAWAY:            'f8e19fbc-6ab0-5d96-8dcb-7683128bce35',
  OTHER:                    'd0db777f-e58b-5ff4-84ba-af70aae4a2e4',
};

// Which category IDs belong to DAILY USE
export const DAILY_USE_CATEGORY_IDS = [
  '287694ab-257a-553d-adbc-a75df1715d7d', // Electronics
  '9d4d190c-3f8d-539f-9c11-5754fa54a6d0', // Auto Parts & Accessories
  'a8c368d7-585d-50c6-980b-7421018c4d3d', // Home & Furniture
  '5306363d-6580-5c73-ba72-4e64b31088f0', // Fashion
  'd2c45247-5679-5de4-9a71-8c88d364bf42', // Shoes
  '4698c01b-e055-591a-a325-f0e4142df7b5', // Jewelry & Watches
  '789f749b-ab2e-53d0-a913-aa4d572b77d7', // Beauty & Personal Care
  'a1a5a10a-5c35-5d9b-b193-ab7f6b007683', // Baby & Kids
  '42132243-e6bb-5f03-b0c0-7e40bec480e6', // Toys & Games
  'c1bc1b6e-fa80-55e6-87f1-293d2004ca8b', // Sports & Outdoors
  'ecc38186-251f-5139-b5e7-21ddbb01f980', // Collectibles & Memorabilia
  '3168c560-910f-5140-bfeb-cb6fefb22122', // Books, Movies & Music
  '94c3f3a1-fb11-5f7d-b08f-fd10c975a8eb', // Hobbies & Crafts
  '25fef732-bb26-539b-af6d-0c174872ba1d', // Musical Instruments
  'e7633c00-d1d6-5ef1-9bf5-cf51b978234a', // Pet Supplies
  '6658eeed-8ef5-597e-a241-99415dfb0377', // Tools & Equipment
  '7a0a1bde-076c-552e-a879-14f099379be3', // Appliances
  'b02e7a5a-ffd5-5193-b9ab-55b59ff16d97', // Garden & Outdoor
  'fb4d57ce-b69c-5bf7-a426-b161d11cc2fd', // Computers & Office
  '20443dfd-5668-5ed0-95cf-fca7f51c539b', // Handmade
  '8a446257-f0f0-5da2-b3b6-cdc666c0012b', // Antiques & Vintage
  '6046a237-9184-5533-a51f-ff690d9adf2b', // Business & Commercial
  'd0db777f-e58b-5ff4-84ba-af70aae4a2e4', // Other
];

// ═══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES
// Old names → New names mapping
// ═══════════════════════════════════════════════════════════════

// Vehicle aliases (old CAR_ → new VEHICLE_)
export const CAR_MAKES         = VEHICLE_MAKES;
export const CAR_MODELS        = VEHICLE_MODELS;
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