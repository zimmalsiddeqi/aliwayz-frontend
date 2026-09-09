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
    // Strip system metadata bracket tags (e.g. [Private_Address]: 123, [Intent]: rent, etc.)
    .replace(/\[(Private_Address|Private_Lat|Private_Lng|Address_Visibility|Intent|Property_Type)\]:[^\n]*/gi, '')
    // Remove standalone metadata brackets
    .replace(/\[(Private_Address|Private_Lat|Private_Lng|Address_Visibility)\]/gi, '')
    .trim();

  // Replace raw system underscores between words (e.g. brand_new -> brand new, single_family -> single family)
  cleaned = cleaned.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, '$1 $2');

  // Collapse excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Extract structured specification pills/grid from product description
 */
export function parseDescriptionSpecs(description) {
  if (!description) return [];
  const data = parseStructuredListingData(description);
  return data.specifications;
}

/**
 * Parses full structured listing data from description text, handling
 * Real Estate, Automotive, and general marketplace listings with clean categorization.
 */
export function parseStructuredListingData(description = '', categoryId = null, product = {}) {
  const result = {
    isRealEstate: false,
    isAutomotive: false,
    highlights: [],
    specifications: [],
    features: [],
    utilitiesIncluded: [],
    policies: [],
    narrativeText: '',
  };

  if (!description && !product) return result;
  const desc = description || '';

  // Determine category type
  const isAuto =
    categoryId === CATEGORY_IDS.AUTOMOTIVE ||
    categoryId === CATEGORY_IDS.VEHICLES ||
    /Make:|Mileage:|Transmission:|Drivetrain:|VIN:|Engine:|Fuel:/i.test(desc) ||
    /car|truck|suv|sedan|motorcycle|vehicle/i.test(product.categories?.name || '');

  const isProp =
    categoryId === CATEGORY_IDS.PROPERTY ||
    categoryId === CATEGORY_IDS.REAL_ESTATE ||
    /Bedrooms?:|Bathrooms?:|Lease Term:|Security Deposit:|Application Fee:|Pet Policy:|Utilities Included:|\[Intent\]:|\[Property_Type\]:/i.test(desc) ||
    /real estate|property|apartment|house|condo|commercial/i.test(product.categories?.name || '');

  result.isAutomotive = isAuto;
  result.isRealEstate = isProp;

  const formatVal = (str) => {
    if (!str) return '';
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  // 1. Extract Features
  const featuresMatch = desc.match(/Features:\s*([^\n]+)/i);
  if (featuresMatch) {
    result.features = featuresMatch[1]
      .split(/,\s*|\s*;\s*/)
      .map((f) => f.trim())
      .filter(Boolean);
  }

  // 2. Extract Utilities Included (Real Estate)
  const utilMatch = desc.match(/Utilities Included:\s*([^\n]+)/i);
  if (utilMatch) {
    result.utilitiesIncluded = utilMatch[1]
      .split(/,\s*|\s*;\s*/)
      .map((u) => u.trim())
      .filter(Boolean);
  }

  // 3. Extract Real Estate Attributes
  if (isProp) {
    const bedsMatch = desc.match(/Bedrooms?:\s*([^\n]+)/i) || desc.match(/Beds?:\s*([^\n]+)/i);
    const bathsMatch = desc.match(/Bathrooms?:\s*([^\n]+)/i) || desc.match(/Baths?:\s*([^\n]+)/i);
    const sizeMatch = desc.match(/Size:\s*([^\n]+)/i) || desc.match(/Available Space:\s*([^\n]+)/i);
    const leaseTermMatch = desc.match(/Lease Term:\s*([^\n]+)/i) || desc.match(/Min Lease Term:\s*([^\n]+)/i);
    const availDateMatch = desc.match(/Available Date:\s*([^\n]+)/i);
    const depositMatch = desc.match(/Security Deposit:\s*([^\n]+)/i);
    const appFeeMatch = desc.match(/Application Fee:\s*([^\n]+)/i);
    const petPolicyMatch = desc.match(/Pet Policy:\s*([^\n]+)/i);
    const smokingMatch = desc.match(/Smoking:\s*([^\n]+)/i);
    const propTypeMatch = desc.match(/\[Property_Type\]:\s*([^\n]+)/i) || desc.match(/Type:\s*([^\n]+)/i);
    const yearBuiltMatch = desc.match(/Year Built:\s*([^\n]+)/i);
    const lotSizeMatch = desc.match(/Lot Size:\s*([^\n]+)/i);
    const buildingSizeMatch = desc.match(/Building Size:\s*([^\n]+)/i);
    const parkingSpacesMatch = desc.match(/Parking Spaces:\s*([^\n]+)/i);
    const hoaMatch = desc.match(/HOA Fees:\s*([^\n]+)/i);
    const taxesMatch = desc.match(/Property Taxes:\s*([^\n]+)/i);
    const checkInMatch = desc.match(/Check-In:\s*([^\n]+)/i);
    const checkOutMatch = desc.match(/Check-Out:\s*([^\n]+)/i);
    const maxGuestsMatch = desc.match(/Max Guests:\s*([^\n]+)/i);
    const minStayMatch = desc.match(/Min Stay:\s*([^\n]+)/i);

    // Highlights
    if (bedsMatch) {
      const beds = bedsMatch[1].replace(/beds?|bedrooms?/i, '').trim();
      result.highlights.push({ label: 'Bedrooms', value: `${beds} ${Number(beds) === 1 ? 'Bed' : 'Beds'}`, icon: 'bed' });
    }
    if (bathsMatch) {
      const baths = bathsMatch[1].replace(/baths?|bathrooms?/i, '').trim();
      result.highlights.push({ label: 'Bathrooms', value: `${baths} ${Number(baths) === 1 ? 'Bath' : 'Baths'}`, icon: 'bath' });
    }
    if (sizeMatch) {
      const size = sizeMatch[1].trim();
      result.highlights.push({ label: 'Area Size', value: size.toLowerCase().includes('sqft') ? size : `${size} sqft`, icon: 'maximize' });
    }
    if (leaseTermMatch) {
      result.highlights.push({ label: 'Lease Term', value: leaseTermMatch[1].trim(), icon: 'calendar' });
    } else if (availDateMatch) {
      result.highlights.push({ label: 'Available', value: availDateMatch[1].trim(), icon: 'calendar' });
    }

    // Specifications
    if (depositMatch) result.specifications.push({ label: 'Security Deposit', value: depositMatch[1].trim(), icon: 'dollar' });
    if (appFeeMatch) result.specifications.push({ label: 'Application Fee', value: appFeeMatch[1].trim(), icon: 'dollar' });
    if (availDateMatch) result.specifications.push({ label: 'Available Date', value: availDateMatch[1].trim(), icon: 'calendar' });
    if (leaseTermMatch) result.specifications.push({ label: 'Lease Term', value: leaseTermMatch[1].trim(), icon: 'clock' });
    if (propTypeMatch) result.specifications.push({ label: 'Property Type', value: formatVal(propTypeMatch[1]), icon: 'home' });
    if (yearBuiltMatch) result.specifications.push({ label: 'Year Built', value: yearBuiltMatch[1].trim(), icon: 'calendar' });
    if (lotSizeMatch) result.specifications.push({ label: 'Lot Size', value: lotSizeMatch[1].trim(), icon: 'layers' });
    if (buildingSizeMatch) result.specifications.push({ label: 'Building Size', value: buildingSizeMatch[1].trim(), icon: 'maximize' });
    if (parkingSpacesMatch) result.specifications.push({ label: 'Parking Spaces', value: parkingSpacesMatch[1].trim(), icon: 'car' });
    if (hoaMatch) result.specifications.push({ label: 'HOA Fees', value: hoaMatch[1].trim(), icon: 'dollar' });
    if (taxesMatch) result.specifications.push({ label: 'Property Taxes', value: taxesMatch[1].trim(), icon: 'dollar' });
    if (maxGuestsMatch) result.specifications.push({ label: 'Max Guests', value: maxGuestsMatch[1].trim(), icon: 'users' });
    if (minStayMatch) result.specifications.push({ label: 'Min Stay', value: minStayMatch[1].trim(), icon: 'moon' });

    // Policies
    if (petPolicyMatch) {
      const rawPet = petPolicyMatch[1].trim();
      const petLabel = /none|no\s*pets|not\s*allowed/i.test(rawPet)
        ? 'No Pets Allowed'
        : `Pets: ${formatVal(rawPet)}`;
      result.policies.push({ label: 'Pet Policy', value: petLabel, allowed: !/none|no/i.test(rawPet), icon: 'pet' });
    }
    if (smokingMatch) {
      const rawSmoking = smokingMatch[1].trim();
      const smokeLabel = /no\s*smoking|not\s*allowed|none/i.test(rawSmoking)
        ? 'No Smoking'
        : `Smoking: ${formatVal(rawSmoking)}`;
      result.policies.push({ label: 'Smoking Policy', value: smokeLabel, allowed: !/no/i.test(rawSmoking), icon: 'smoke' });
    }
    if (checkInMatch) result.policies.push({ label: 'Check-In', value: checkInMatch[1].trim(), icon: 'clock' });
    if (checkOutMatch) result.policies.push({ label: 'Check-Out', value: checkOutMatch[1].trim(), icon: 'clock' });
  }

  // 4. Extract Automotive Attributes
  if (isAuto) {
    const makeMatch = desc.match(/Make:\s*([^\n]+)/i);
    const modelMatch = desc.match(/Model:\s*([^\n]+)/i);
    const yearMatch = desc.match(/Year:\s*(\d{4})/i);
    const mileageMatch = desc.match(/Mileage:\s*([^\n]+)/i);
    const fuelMatch = desc.match(/Fuel:\s*([^\n]+)/i);
    const transMatch = desc.match(/Transmission:\s*([^\n]+)/i);
    const drivetrainMatch = desc.match(/Drivetrain:\s*([^\n]+)/i);
    const bodyMatch = desc.match(/Body:\s*([^\n]+)/i);
    const engineMatch = desc.match(/Engine:\s*([^\n]+)/i);
    const colorMatch = desc.match(/Color:\s*([^\n]+)/i);
    const ownersMatch = desc.match(/Previous Owners:\s*([^\n]+)/i);
    const titleStatusMatch = desc.match(/Title Status:\s*([^\n]+)/i);
    const sellerTypeMatch = desc.match(/Seller:\s*([^\n]+)/i);
    const registrationMatch = desc.match(/Registration:\s*([^\n]+)/i);
    const vinMatch = desc.match(/VIN:\s*([^\n]+)/i);

    // Highlights
    if (mileageMatch) {
      const rawNum = mileageMatch[1].replace(/\D/g, '');
      const mileageVal = rawNum ? `${Number(rawNum).toLocaleString()} mi` : mileageMatch[1].trim();
      result.highlights.push({ label: 'Mileage', value: mileageVal, icon: 'gauge' });
    }
    if (fuelMatch) {
      result.highlights.push({ label: 'Fuel Type', value: formatVal(fuelMatch[1]), icon: 'fuel' });
    }
    if (transMatch) {
      result.highlights.push({ label: 'Transmission', value: formatVal(transMatch[1]), icon: 'cog' });
    }
    if (drivetrainMatch || bodyMatch) {
      const driveOrBody = drivetrainMatch ? formatVal(drivetrainMatch[1].split('(')[0]) : formatVal(bodyMatch[1]);
      result.highlights.push({ label: 'Drivetrain', value: driveOrBody, icon: 'car' });
    }

    // Specifications
    if (makeMatch) result.specifications.push({ label: 'Make', value: formatVal(makeMatch[1]), icon: 'car' });
    if (modelMatch) result.specifications.push({ label: 'Model', value: formatVal(modelMatch[1]), icon: 'car' });
    if (yearMatch) result.specifications.push({ label: 'Year', value: yearMatch[1], icon: 'calendar' });
    if (mileageMatch) result.specifications.push({ label: 'Mileage', value: mileageMatch[1].trim(), icon: 'gauge' });
    if (fuelMatch) result.specifications.push({ label: 'Fuel Type', value: formatVal(fuelMatch[1]), icon: 'fuel' });
    if (transMatch) result.specifications.push({ label: 'Transmission', value: formatVal(transMatch[1]), icon: 'cog' });
    if (drivetrainMatch) result.specifications.push({ label: 'Drivetrain', value: drivetrainMatch[1].trim(), icon: 'layers' });
    if (bodyMatch) result.specifications.push({ label: 'Body Style', value: formatVal(bodyMatch[1]), icon: 'car' });
    if (engineMatch) result.specifications.push({ label: 'Engine', value: engineMatch[1].trim(), icon: 'zap' });
    if (colorMatch) result.specifications.push({ label: 'Exterior Color', value: formatVal(colorMatch[1]), icon: 'palette' });
    if (ownersMatch) result.specifications.push({ label: 'Previous Owners', value: ownersMatch[1].trim(), icon: 'users' });
    if (titleStatusMatch) result.specifications.push({ label: 'Title Status', value: formatVal(titleStatusMatch[1]), icon: 'shield' });
    if (sellerTypeMatch) result.specifications.push({ label: 'Seller Type', value: formatVal(sellerTypeMatch[1]), icon: 'user' });
    if (registrationMatch) result.specifications.push({ label: 'Registration', value: registrationMatch[1].trim(), icon: 'map-pin' });
    if (vinMatch) result.specifications.push({ label: 'VIN', value: vinMatch[1].trim(), icon: 'hash' });
  }

  // 5. Extract remaining narrative / story text
  // Remove known key-value lines and bracket tags to leave only the real user description
  const lines = desc.split('\n');
  const narrativeLines = [];
  let inDescriptionSection = false;

  const keyPattern = /^(Make|Model|Year|Mileage|Fuel|Transmission|Drivetrain|Body|Engine|Color|Previous Owners|Title Status|Seller|VIN|Registration|Features|Bedrooms?|Bathrooms?|Beds?|Baths?|Size|Security Deposit|Application Fee|Available Date|Lease Term|Pet Policy|Smoking|Utilities Included|Pricing Type|Available Space|Min Lease Term|Max Lease Term|Building Size|Ceiling Height|Parking Spaces|Loading Dock|Zoning|HVAC|Utilities|Restrooms|Signage|Accessibility|CAM\/NNN|Build-out Allowance|Renewal Options|Tenant Improvements|Weekend Rate|Cleaning Fee|Additional Guest Fee|Min Stay|Max Guests|Check-In|Check-Out|Lot Size|Year Built|HOA Fees|Property Taxes|Special Assessment|Listing|Type|\[.*?\]):/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inDescriptionSection || narrativeLines.length > 0) {
        narrativeLines.push('');
      }
      continue;
    }

    if (/^Description:\s*$/i.test(trimmed)) {
      inDescriptionSection = true;
      continue;
    }

    if (inDescriptionSection) {
      if (!keyPattern.test(trimmed) && !trimmed.startsWith('[')) {
        narrativeLines.push(trimmed);
      } else {
        inDescriptionSection = false;
      }
      continue;
    }

    if (!keyPattern.test(trimmed) && !trimmed.startsWith('[')) {
      narrativeLines.push(trimmed);
    }
  }

  result.narrativeText = narrativeLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result;
}