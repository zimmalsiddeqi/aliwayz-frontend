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