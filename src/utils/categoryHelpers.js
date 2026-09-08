import { CATEGORY_IDS } from '@utils/constants';

/**
 * Get all category IDs for a main category (parent + all children)
 * Used to fetch ALL products within a main category section
 */
export function getCategoryIdsForMain(mainCategory, allCategories = []) {
  let parentId = null;

  switch (mainCategory) {
    case 'cars':
      parentId = CATEGORY_IDS.AUTOMOTIVE;
      break;
    case 'property':
      parentId = CATEGORY_IDS.PROPERTY;
      break;
    case 'daily-use':
      // Return all categories EXCEPT automotive and property
      return allCategories
        .filter((c) => {
          const id = c.id;
          // Exclude automotive parent + children
          if (id === CATEGORY_IDS.AUTOMOTIVE) return false;
          if (c.parent_id === CATEGORY_IDS.AUTOMOTIVE) return false;
          // Exclude property parent + children
          if (id === CATEGORY_IDS.PROPERTY) return false;
          if (c.parent_id === CATEGORY_IDS.PROPERTY) return false;
          return true;
        })
        .map((c) => c.id);
    default:
      return [];
  }

  if (!parentId) return [];

  // Return parent + all children
  const ids = [parentId];
  allCategories.forEach((c) => {
    if (c.parent_id === parentId) {
      ids.push(c.id);
    }
  });

  return ids;
}

/**
 * Get the parent category ID for a main category
 */
export function getParentCategoryId(mainCategory) {
  switch (mainCategory) {
    case 'cars':     return CATEGORY_IDS.AUTOMOTIVE;
    case 'property': return CATEGORY_IDS.PROPERTY;
    default:         return null;
  }
}

/**
 * Get subcategories for a main category
 */
export function getSubcategories(mainCategory, allCategories = []) {
  const parentId = getParentCategoryId(mainCategory);

  if (mainCategory === 'daily-use') {
    return allCategories.filter((c) => {
      if (!c.parent_id) {
        // Top-level categories that are NOT automotive or property
        return (
          c.id !== CATEGORY_IDS.AUTOMOTIVE &&
          c.id !== CATEGORY_IDS.PROPERTY
        );
      }
      return false;
    });
  }

  if (!parentId) return [];

  return allCategories.filter((c) => c.parent_id === parentId);
}

/**
 * Check if a category ID belongs to a main category
 */
export function categoryBelongsTo(categoryId, mainCategory, allCategories = []) {
  const ids = getCategoryIdsForMain(mainCategory, allCategories);
  return ids.includes(categoryId);
}

/**
 * Helper to parse custom real estate attributes from description string
 */
export function parsePropertyDescription(description) {
  const result = {
    intent: 'sale',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    areaSize: '',
    address: '',
    addressVisibility: 'approximate',
  };
  if (!description) return result;

  // Extract from tags
  const intentMatch = description.match(/\[Intent\]:\s*(\w+)/);
  if (intentMatch) result.intent = intentMatch[1];
  else if (description.includes('Listing: For Rent')) result.intent = 'rent';
  else if (description.includes('Listing: For Lease')) result.intent = 'lease';
  else if (description.includes('Listing: Vacation Rental')) result.intent = 'vacation';

  const typeMatch = description.match(/\[Property_Type\]:\s*([\w_]+)/) || description.match(/Type:\s*([^\n]+)/);
  if (typeMatch) result.propertyType = typeMatch[1].trim();

  const bedsMatch = description.match(/Beds?:\s*([^\n]+)/) || description.match(/Bedrooms?:\s*([^\n]+)/);
  if (bedsMatch) result.bedrooms = bedsMatch[1].trim();

  const bathsMatch = description.match(/Baths?:\s*([^\n]+)/) || description.match(/Bathrooms?:\s*([^\n]+)/);
  if (bathsMatch) result.bathrooms = bathsMatch[1].trim();

  const sizeMatch = description.match(/Size:\s*([^\n]+)/) || description.match(/Available Space:\s*([^\n]+)/);
  if (sizeMatch) result.areaSize = sizeMatch[1].trim();

  const addrMatch = description.match(/\[Private_Address\]:\s*([^\n]+)/) || description.match(/Address:\s*([^\n]+)/);
  if (addrMatch) result.address = addrMatch[1].trim();

  const visMatch = description.match(/\[Address_Visibility\]:\s*([^\n]+)/);
  if (visMatch) result.addressVisibility = visMatch[1].trim();

  return result;
}

/**
 * Strips private address and visibility tags from description shown to buyers
 */
export function stripPrivateTags(description) {
  if (!description) return '';
  return description
    .replace(/\[Private_Address\]:[^\n]*/gi, '')
    .replace(/\[Private_Lat\]:[^\n]*/gi, '')
    .replace(/\[Private_Lng\]:[^\n]*/gi, '')
    .replace(/\[Address_Visibility\]:[^\n]*/gi, '')
    .trim();
}

/**
 * Strips all internal tags, raw key-value lines, brackets, and underscores from description
 * to produce clean, professional body text for display.
 */
export function getCleanDescriptionText(description) {
  if (!description) return '';

  let cleaned = description
    // Strip bracketed tags e.g. [Private_Address]: 123 Main, [Intent]: rent, [Condition]: brand_new
    .replace(/\[[A-Za-z0-9_]+\]:[^\n]*/gi, '')
    // Strip key-value lines like "Make: Toyota", "Model: Camry", "Year: 2022", "Mileage: 42000 miles", "Beds: 2", "Baths: 2", "Size: 1200", "Listing: For Rent", "Type: Apartment", "Pricing Type: sqft_month", "Condition: brand_new"
    .replace(/^(Make|Model|Year|Mileage|Fuel|Transmission|Drivetrain|Body|Engine|Color|Previous Owners|Title Status|Seller|VIN|Registration|Features|Listing|Type|Beds|Bedrooms|Baths|Bathrooms|Size|Available Space|Acreage|Address|Pricing Type|Condition):\s*[^\n]*/gim, '')
    // Strip standalone bracketed tags [ ...]
    .replace(/\[[^\]]*\]/g, '')
    .trim();

  // Replace remaining raw underscores between words with spaces (e.g. brand_new -> brand new)
  cleaned = cleaned.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, '$1 $2');

  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();

  return cleaned;
}

/**
 * Extract structured specification pills/grid from product description
 */
export function parseDescriptionSpecs(description) {
  if (!description) return [];
  const specs = [];

  const formatVal = (str) => {
    if (!str) return '';
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Car / Vehicle Specs
  const yearMatch = description.match(/Year:\s*(\d{4})/i);
  const makeMatch = description.match(/Make:\s*([^\n]+)/i);
  const modelMatch = description.match(/Model:\s*([^\n]+)/i);
  if (yearMatch || makeMatch || modelMatch) {
    const y = yearMatch ? yearMatch[1] : '';
    const m = makeMatch ? makeMatch[1].trim() : '';
    const md = modelMatch ? modelMatch[1].trim() : '';
    const carTitle = [y, m, md].filter(Boolean).join(' ');
    if (carTitle) specs.push({ label: 'Vehicle', value: carTitle, icon: '🚗' });
  }

  const mileageMatch = description.match(/Mileage:\s*([^\n]+)/i);
  if (mileageMatch) {
    const val = mileageMatch[1].trim();
    const rawNum = val.replace(/\D/g, '');
    const formatted = rawNum ? `${Number(rawNum).toLocaleString()} mi` : val;
    specs.push({ label: 'Mileage', value: formatted, icon: '📏' });
  }

  const transMatch = description.match(/Transmission:\s*([^\n]+)/i);
  if (transMatch) specs.push({ label: 'Transmission', value: formatVal(transMatch[1].trim()), icon: '⚙️' });

  const fuelMatch = description.match(/Fuel:\s*([^\n]+)/i);
  if (fuelMatch) specs.push({ label: 'Fuel Type', value: formatVal(fuelMatch[1].trim()), icon: '⛽' });

  const bodyMatch = description.match(/Body:\s*([^\n]+)/i);
  if (bodyMatch) specs.push({ label: 'Body Style', value: formatVal(bodyMatch[1].trim()), icon: '🏎️' });

  const titleStatusMatch = description.match(/Title Status:\s*([^\n]+)/i);
  if (titleStatusMatch) specs.push({ label: 'Title Status', value: formatVal(titleStatusMatch[1].trim()), icon: '📋' });

  const colorMatch = description.match(/Color:\s*([^\n]+)/i);
  if (colorMatch) specs.push({ label: 'Color', value: formatVal(colorMatch[1].trim()), icon: '🎨' });

  // Property / Real Estate Specs
  const propTypeMatch = description.match(/\[Property_Type\]:\s*([^\n]+)/i) || description.match(/Type:\s*([^\n]+)/i);
  if (propTypeMatch) specs.push({ label: 'Property Type', value: formatVal(propTypeMatch[1].trim()), icon: '🏠' });

  const intentMatch = description.match(/\[Intent\]:\s*([^\n]+)/i) || description.match(/Listing:\s*([^\n]+)/i);
  if (intentMatch) specs.push({ label: 'Listing Type', value: formatVal(intentMatch[1].trim()), icon: '🔑' });

  const bedsMatch = description.match(/Beds?:\s*([^\n]+)/i) || description.match(/Bedrooms?:\s*([^\n]+)/i);
  if (bedsMatch) specs.push({ label: 'Bedrooms', value: `${bedsMatch[1].trim()} Bd`, icon: '🛏️' });

  const bathsMatch = description.match(/Baths?:\s*([^\n]+)/i) || description.match(/Bathrooms?:\s*([^\n]+)/i);
  if (bathsMatch) specs.push({ label: 'Bathrooms', value: `${bathsMatch[1].trim()} Ba`, icon: '自由' });

  const sizeMatch = description.match(/Size:\s*([^\n]+)/i) || description.match(/Available Space:\s*([^\n]+)/i);
  if (sizeMatch) specs.push({ label: 'Area Size', value: sizeMatch[1].trim(), icon: '📐' });

  const acreageMatch = description.match(/Acreage:\s*([^\n]+)/i);
  if (acreageMatch) specs.push({ label: 'Acreage', value: `${acreageMatch[1].trim()} acres`, icon: '🏞️' });

  // Condition (if in bracket tag or key)
  const condMatch = description.match(/\[Condition\]:\s*([^\n]+)/i) || description.match(/Condition:\s*([^\n]+)/i);
  if (condMatch) specs.push({ label: 'Condition', value: formatVal(condMatch[1].trim()), icon: '✨' });

  // Features
  const featuresMatch = description.match(/Features:\s*([^\n]+)/i);
  if (featuresMatch) specs.push({ label: 'Features', value: featuresMatch[1].trim(), icon: '⭐' });

  return specs;
}