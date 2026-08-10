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