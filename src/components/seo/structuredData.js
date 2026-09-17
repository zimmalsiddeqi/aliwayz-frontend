/**
 * Structured Data Builders for Aliwayz SEO
 * 
 * Generates Schema.org JSON-LD objects for various page types.
 * Used with the SEOHead component's `structuredData` prop.
 */

const SITE_URL = 'https://aliwayz.com';
const SITE_NAME = 'Aliwayz';
const ORG_NAME = 'Aliwayz LLC';
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Schema.org ItemCondition mapping
 */
const CONDITION_MAP = {
  new: 'https://schema.org/NewCondition',
  like_new: 'https://schema.org/UsedCondition',
  good: 'https://schema.org/UsedCondition',
  fair: 'https://schema.org/UsedCondition',
  poor: 'https://schema.org/UsedCondition',
  used: 'https://schema.org/UsedCondition',
};

/**
 * Build Organization schema (global, used on homepage)
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
    sameAs: [],
  };
}

/**
 * Build WebSite schema with SearchAction (Sitelinks Searchbox)
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Build Product + Offer schema for product detail pages
 */
export function buildProductSchema(product) {
  if (!product) return null;

  const primaryImage = product.product_images?.find(img => img.is_primary)
    || product.product_images?.[0];
  const imageUrl = primaryImage?.cdn_url || primaryImage?.thumbnail_cdn_url;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description
      ? product.description.replace(/\[.*?\]/g, '').substring(0, 500).trim()
      : undefined,
    image: product.product_images
      ?.map(img => img.cdn_url || img.thumbnail_cdn_url)
      .filter(Boolean) || (imageUrl ? [imageUrl] : undefined),
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: product.currency || 'USD',
      price: product.price || 0,
      itemCondition: CONDITION_MAP[product.condition] || 'https://schema.org/UsedCondition',
      availability: product.status === 'available'
        ? 'https://schema.org/InStock'
        : product.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/OutOfStock',
    },
  };

  // Add brand if available
  if (product.brand) {
    schema.brand = { '@type': 'Brand', name: product.brand };
  }

  // Add color if available
  if (product.color) {
    schema.color = product.color;
  }

  // Add seller info
  if (product.stores?.store_name) {
    schema.offers.seller = {
      '@type': 'Organization',
      name: product.stores.store_name,
      url: product.stores.slug ? `${SITE_URL}/store/${product.stores.slug}` : undefined,
    };
  } else if (product.users?.username) {
    schema.offers.seller = {
      '@type': 'Person',
      name: product.users.full_name || product.users.username,
    };
  }

  // Add aggregate rating if store has reviews
  if (product.stores?.average_rating && product.stores?.total_reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.stores.average_rating,
      reviewCount: product.stores.total_reviews,
    };
  }

  // Add date info
  if (product.created_at) {
    schema.datePublished = product.created_at;
  }
  if (product.updated_at) {
    schema.dateModified = product.updated_at;
  }

  return schema;
}

/**
 * Build Store / LocalBusiness schema for store profile pages
 */
export function buildStoreSchema(store) {
  if (!store) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.store_name,
    description: store.description || `${store.store_name} on Aliwayz`,
    url: `${SITE_URL}/store/${store.slug}`,
    image: store.logo_url || store.banner_url || LOGO_URL,
  };

  // Add location
  if (store.location_city) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: store.location_city,
      addressCountry: 'US',
    };
  }

  // Add aggregate rating
  if (store.average_rating && store.total_reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: store.average_rating,
      reviewCount: store.total_reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add social links
  const sameAs = [];
  if (store.social_instagram) sameAs.push(store.social_instagram);
  if (store.social_facebook) sameAs.push(store.social_facebook);
  if (store.social_tiktok) sameAs.push(store.social_tiktok);
  if (store.social_youtube) sameAs.push(store.social_youtube);
  if (store.website) sameAs.push(store.website);
  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}

/**
 * Build FAQPage schema for the FAQ page
 */
export function buildFAQSchema(sections) {
  if (!sections || sections.length === 0) return null;

  const questions = [];
  sections.forEach(section => {
    const list = section.items || section.faqs;
    if (list) {
      list.forEach(item => {
        questions.push({
          '@type': 'Question',
          name: item.q || item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a || item.answer,
          },
        });
      });
    }
  });

  if (questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

/**
 * Build BreadcrumbList schema
 * @param {Array} items - Array of { name, url } objects
 */
export function buildBreadcrumbSchema(items) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? (item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`) : undefined,
    })),
  };
}

/**
 * Build ProfilePage + Person schema for public profile pages
 */
export function buildProfileSchema(profile) {
  if (!profile) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.full_name || profile.username,
      alternateName: `@${profile.username}`,
      image: profile.avatar_url || undefined,
      description: profile.bio || undefined,
      address: profile.location_city
        ? { '@type': 'PostalAddress', addressLocality: profile.location_city }
        : undefined,
    },
  };
}

/**
 * Build CollectionPage + ItemList schema for category/marketplace pages
 */
export function buildCollectionPageSchema(name, url, products) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  };

  if (products && products.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/product/${product.id}`,
        name: product.title,
      })),
    };
  }

  return schema;
}
