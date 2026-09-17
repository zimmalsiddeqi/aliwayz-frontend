/**
 * SEOHead — Reusable SEO metadata component for Aliwayz
 * 
 * Uses react-helmet-async to inject title, meta, canonical, OG, Twitter,
 * and JSON-LD structured data into the document <head>.
 * 
 * Modeled after the excellent pattern in LegalLayout.jsx.
 */
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://aliwayz.com';
const SITE_NAME = 'Aliwayz';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  noindex = false,
  nofollow = false,
  structuredData,
}) {
  // Build robots directive
  const robotsIndex = noindex ? 'noindex' : 'index';
  const robotsFollow = nofollow ? 'nofollow' : 'follow';
  const robotsContent = `${robotsIndex}, ${robotsFollow}`;

  // Resolve image — use provided or fallback to default
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedImageAlt = ogImageAlt || title || SITE_NAME;

  // Ensure canonical is absolute
  const resolvedCanonical = canonical
    ? canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`
    : undefined;

  return (
    <Helmet>
      {/* Title */}
      {title && <title>{title}</title>}

      {/* Meta Description */}
      {description && <meta name="description" content={description} />}

      {/* Robots */}
      <meta name="robots" content={robotsContent} />

      {/* Canonical */}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={resolvedImageAlt} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={resolvedImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(structuredData) ? structuredData : structuredData
          )}
        </script>
      )}
    </Helmet>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
