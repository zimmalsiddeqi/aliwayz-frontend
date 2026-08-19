import {
  Shield,
  FileText,
  Cookie,
  Store,
  ShoppingBag,
  Users,
  Ban,
  UserX,
  Database,
  Flag,
  Scale,
  Copyright,
  AlertTriangle,
  HeartHandshake,
  Mail,
  Info,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// ALIWAYZ LEGAL CENTER — Single Source of Truth
// ═══════════════════════════════════════════════════════════════
// This file is the central registry for every legal page in
// the Aliwayz Legal Center. All metadata, SEO values, compliance
// flags, navigation links, and helper functions live here.
//
// Consumed by:
//   - LegalIndexPage (hub grid)
//   - LegalLayout (breadcrumbs, title, TOC)
//   - LegalTableOfContents (sidebar navigation)
//   - Footer.jsx (company/support links)
//   - router/routes.js (lazy imports)
//   - router/index.jsx (route definitions)
//   - Individual legal page components (SEO, sections)
// ═══════════════════════════════════════════════════════════════

// ── Constants ─────────────────────────────────────────────────

import {
  SITE_NAME as APP_NAME,
  SITE_URL,
  DEVELOPER_NAME as DEVELOPER,
  LAST_UPDATED,
  LAST_UPDATED_ISO,
  MIN_AGE,
  SUPPORT_EMAILS,
} from '../../../config/site.js';

export { APP_NAME, SITE_URL, DEVELOPER, LAST_UPDATED, LAST_UPDATED_ISO, MIN_AGE, SUPPORT_EMAILS };
export const LEGAL_BASE_URL = `${SITE_URL}/legal`;

// ── Categories ────────────────────────────────────────────────

export const LEGAL_CATEGORIES = [
  {
    id:          'legal',
    title:       'Legal',
    description: 'Policies governing your use of Aliwayz.',
    color:       'var(--color-brand)',
  },
  {
    id:          'marketplace',
    title:       'Marketplace',
    description: 'Rules and guidelines for buying and selling.',
    color:       '#8B5CF6',
  },
  {
    id:          'account',
    title:       'Account & Data',
    description: 'Managing your account and personal data.',
    color:       'var(--color-info)',
  },
  {
    id:          'safety',
    title:       'Safety & Support',
    description: 'Staying safe and getting help.',
    color:       'var(--color-success)',
  },
];

/** Alias — use whichever reads better at the call site. */
export const LEGAL_CENTER_CATEGORIES = LEGAL_CATEGORIES;

// ── Page Registry ─────────────────────────────────────────────

export const LEGAL_PAGES = [
  // ─── Legal ──────────────────────────────────────────────────
  {
    slug:           'privacy-policy',
    title:          'Privacy Policy',
    shortTitle:     'Privacy Policy',
    breadcrumbTitle: 'Privacy Policy',
    description:    'Learn how Aliwayz collects, uses, and protects your personal information.',
    seoTitle:       'Privacy Policy — Aliwayz',
    seoDescription: 'Read the Aliwayz Privacy Policy to understand how we collect, use, store, and protect your personal information when you use our marketplace platform.',
    canonicalPath:  '/legal/privacy-policy',
    icon:           Shield,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       1,

    footerVisible:          true,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz privacy policy',
      'data collection',
      'personal information',
      'marketplace privacy',
      'data protection',
      'user data rights',
    ],
    relatedPages: ['terms', 'cookie-policy', 'data-deletion', 'account-deletion'],

    sections: [
      { id: 'information-we-collect',   title: 'Information We Collect' },
      { id: 'how-we-use-information',   title: 'How We Use Your Information' },
      { id: 'how-we-share-information', title: 'How We Share Your Information' },
      { id: 'third-party-services',     title: 'Third-Party Services' },
      { id: 'data-retention',           title: 'Data Retention' },
      { id: 'data-security',            title: 'Data Security' },
      { id: 'your-rights',              title: 'Your Rights' },
      { id: 'california-privacy',       title: 'California Privacy Rights' },
      { id: 'international-users',      title: 'International Users' },
      { id: 'account-deletion',         title: 'Account Deletion' },
      { id: 'childrens-privacy',        title: "Children's Privacy" },
      { id: 'changes-to-policy',        title: 'Changes to This Policy' },
      { id: 'contact-us',               title: 'Contact Us' },
    ],
  },
  {
    slug:           'terms',
    title:          'Terms & Conditions',
    shortTitle:     'Terms',
    breadcrumbTitle: 'Terms & Conditions',
    description:    'The terms that govern your use of the Aliwayz marketplace platform.',
    seoTitle:       'Terms & Conditions — Aliwayz',
    seoDescription: 'Review the Aliwayz Terms and Conditions that govern your use of our marketplace platform, including user responsibilities, listings, and transactions.',
    canonicalPath:  '/legal/terms',
    icon:           FileText,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       2,

    footerVisible:          true,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz terms and conditions',
      'terms of use',
      'user agreement',
      'marketplace terms',
      'terms of service',
    ],
    relatedPages: ['privacy-policy', 'community-guidelines', 'disclaimer'],

    sections: [
      { id: 'acceptance-of-terms',      title: 'Acceptance of Terms' },
      { id: 'eligibility',              title: 'Eligibility' },
      { id: 'account-registration',     title: 'Account Registration' },
      { id: 'marketplace-services',     title: 'Marketplace Services' },
      { id: 'user-conduct',             title: 'User Conduct' },
      { id: 'listings-and-content',     title: 'Listings and Content' },
      { id: 'transactions',             title: 'Transactions' },
      { id: 'intellectual-property',    title: 'Intellectual Property' },
      { id: 'limitation-of-liability',  title: 'Limitation of Liability' },
      { id: 'indemnification',          title: 'Indemnification' },
      { id: 'termination',              title: 'Termination' },
      { id: 'governing-law',            title: 'Governing Law' },
      { id: 'changes-to-terms',         title: 'Changes to These Terms' },
      { id: 'contact-us',               title: 'Contact Us' },
    ],
  },
  {
    slug:           'cookie-policy',
    title:          'Cookie Policy',
    shortTitle:     'Cookies',
    breadcrumbTitle: 'Cookie Policy',
    description:    'Understand how Aliwayz uses cookies and similar technologies.',
    seoTitle:       'Cookie Policy — Aliwayz',
    seoDescription: 'Learn how Aliwayz uses cookies and similar tracking technologies to improve your experience on our marketplace platform.',
    canonicalPath:  '/legal/cookie-policy',
    icon:           Cookie,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       3,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz cookie policy',
      'cookies',
      'tracking technologies',
      'browser cookies',
      'local storage',
    ],
    relatedPages: ['privacy-policy', 'terms'],

    sections: [
      { id: 'what-are-cookies',    title: 'What Are Cookies' },
      { id: 'how-we-use-cookies',  title: 'How We Use Cookies' },
      { id: 'types-of-cookies',    title: 'Types of Cookies' },
      { id: 'third-party-cookies', title: 'Third-Party Cookies' },
      { id: 'managing-cookies',    title: 'Managing Your Cookies' },
      { id: 'changes-to-policy',   title: 'Changes to This Policy' },
      { id: 'contact-us',          title: 'Contact Us' },
    ],
  },
  {
    slug:           'disclaimer',
    title:          'Disclaimer',
    shortTitle:     'Disclaimer',
    breadcrumbTitle: 'Disclaimer',
    description:    'Important disclaimers regarding the use of Aliwayz.',
    seoTitle:       'Disclaimer — Aliwayz',
    seoDescription: 'Read important disclaimers about the Aliwayz marketplace platform, including limitations of liability and user content responsibilities.',
    canonicalPath:  '/legal/disclaimer',
    icon:           AlertTriangle,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       13,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz disclaimer',
      'limitation of liability',
      'no warranty',
      'marketplace disclaimer',
    ],
    relatedPages: ['terms', 'copyright'],

    sections: [
      { id: 'general-disclaimer',       title: 'General Disclaimer' },
      { id: 'no-warranty',              title: 'No Warranty' },
      { id: 'marketplace-transactions', title: 'Marketplace Transactions' },
      { id: 'user-content',             title: 'User Content' },
      { id: 'third-party-links',        title: 'Third-Party Links' },
      { id: 'limitation-of-liability',  title: 'Limitation of Liability' },
      { id: 'contact-us',               title: 'Contact Us' },
    ],
  },
  {
    slug:           'copyright',
    title:          'Copyright Notice',
    shortTitle:     'Copyright',
    breadcrumbTitle: 'Copyright',
    description:    'Copyright information and intellectual property rights for Aliwayz.',
    seoTitle:       'Copyright Notice — Aliwayz',
    seoDescription: 'Copyright information for the Aliwayz marketplace platform, including ownership rights, permitted use, and DMCA procedures.',
    canonicalPath:  '/legal/copyright',
    icon:           Copyright,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       12,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz copyright',
      'copyright notice',
      'dmca',
      'intellectual property',
      'content ownership',
    ],
    relatedPages: ['intellectual-property', 'terms'],

    sections: [
      { id: 'copyright-ownership', title: 'Copyright Ownership' },
      { id: 'permitted-use',       title: 'Permitted Use' },
      { id: 'restrictions',        title: 'Restrictions' },
      { id: 'user-content',        title: 'User Content' },
      { id: 'dmca-notice',         title: 'DMCA Notice' },
      { id: 'contact-us',          title: 'Contact Us' },
    ],
  },
  {
    slug:           'intellectual-property',
    title:          'Intellectual Property Policy',
    shortTitle:     'IP Policy',
    breadcrumbTitle: 'Intellectual Property',
    description:    'How Aliwayz handles intellectual property rights and infringement claims.',
    seoTitle:       'Intellectual Property Policy — Aliwayz',
    seoDescription: 'Learn how Aliwayz protects intellectual property rights, handles infringement reports, and enforces its repeat-infringer policy.',
    canonicalPath:  '/legal/intellectual-property',
    icon:           Scale,
    category:       'legal',
    pageCategory:   'Legal',
    priority:       11,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz intellectual property',
      'ip policy',
      'trademark',
      'infringement',
      'dmca takedown',
    ],
    relatedPages: ['copyright', 'terms', 'report-abuse'],

    sections: [
      { id: 'overview',               title: 'Overview' },
      { id: 'aliwayz-ip',             title: 'Aliwayz Intellectual Property' },
      { id: 'user-content-rights',    title: 'User Content Rights' },
      { id: 'reporting-infringement', title: 'Reporting Infringement' },
      { id: 'counter-notification',   title: 'Counter-Notification' },
      { id: 'repeat-infringers',      title: 'Repeat Infringers' },
      { id: 'contact-us',             title: 'Contact Us' },
    ],
  },

  // ─── Marketplace ────────────────────────────────────────────
  {
    slug:           'seller-policy',
    title:          'Seller Policy',
    shortTitle:     'Seller Policy',
    breadcrumbTitle: 'Seller Policy',
    description:    'Rules and responsibilities for sellers on the Aliwayz marketplace.',
    seoTitle:       'Seller Policy — Aliwayz',
    seoDescription: 'Understand the rules, requirements, and responsibilities for selling on the Aliwayz marketplace, including listing standards and QR verification.',
    canonicalPath:  '/legal/seller-policy',
    icon:           Store,
    category:       'marketplace',
    pageCategory:   'Marketplace',
    priority:       4,

    footerVisible:          false,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz seller policy',
      'selling rules',
      'listing requirements',
      'seller guidelines',
      'marketplace seller',
    ],
    relatedPages: ['buyer-policy', 'community-guidelines', 'prohibited-items', 'terms'],

    sections: [
      { id: 'seller-eligibility',    title: 'Seller Eligibility' },
      { id: 'listing-requirements',  title: 'Listing Requirements' },
      { id: 'pricing-and-payments',  title: 'Pricing and Payments' },
      { id: 'seller-conduct',        title: 'Seller Conduct' },
      { id: 'qr-verification',       title: 'QR Verification' },
      { id: 'prohibited-activities', title: 'Prohibited Activities' },
      { id: 'account-standing',      title: 'Account Standing' },
      { id: 'contact-us',            title: 'Contact Us' },
    ],
  },
  {
    slug:           'buyer-policy',
    title:          'Buyer Policy',
    shortTitle:     'Buyer Policy',
    breadcrumbTitle: 'Buyer Policy',
    description:    'Guidelines and protections for buyers using Aliwayz.',
    seoTitle:       'Buyer Policy — Aliwayz',
    seoDescription: 'Review the guidelines and best practices for buying on Aliwayz, including communication, QR verification, and safety recommendations.',
    canonicalPath:  '/legal/buyer-policy',
    icon:           ShoppingBag,
    category:       'marketplace',
    pageCategory:   'Marketplace',
    priority:       5,

    footerVisible:          false,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz buyer policy',
      'buying guidelines',
      'buyer protection',
      'marketplace buyer',
      'safe purchasing',
    ],
    relatedPages: ['seller-policy', 'safety-guidelines', 'community-guidelines'],

    sections: [
      { id: 'buyer-responsibilities',  title: 'Buyer Responsibilities' },
      { id: 'browsing-and-purchasing', title: 'Browsing and Purchasing' },
      { id: 'communication',           title: 'Communication with Sellers' },
      { id: 'qr-verification',         title: 'QR Verification' },
      { id: 'safety-tips',             title: 'Safety Tips for Buyers' },
      { id: 'reporting-issues',        title: 'Reporting Issues' },
      { id: 'contact-us',              title: 'Contact Us' },
    ],
  },
  {
    slug:           'community-guidelines',
    title:          'Community Guidelines',
    shortTitle:     'Guidelines',
    breadcrumbTitle: 'Community Guidelines',
    description:    'Standards of behavior for the Aliwayz community.',
    seoTitle:       'Community Guidelines — Aliwayz',
    seoDescription: 'Review the community standards and behavioral expectations for all Aliwayz users, including respectful conduct, honest listings, and safe transactions.',
    canonicalPath:  '/legal/community-guidelines',
    icon:           Users,
    category:       'marketplace',
    pageCategory:   'Marketplace',
    priority:       6,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz community guidelines',
      'community standards',
      'user conduct',
      'marketplace behavior',
      'community rules',
    ],
    relatedPages: ['terms', 'prohibited-items', 'report-abuse', 'safety-guidelines'],

    sections: [
      { id: 'our-community',        title: 'Our Community' },
      { id: 'respectful-behavior',  title: 'Respectful Behavior' },
      { id: 'honest-listings',      title: 'Honest Listings' },
      { id: 'safe-transactions',    title: 'Safe Transactions' },
      { id: 'prohibited-behavior',  title: 'Prohibited Behavior' },
      { id: 'reporting-violations', title: 'Reporting Violations' },
      { id: 'enforcement',          title: 'Enforcement' },
      { id: 'contact-us',           title: 'Contact Us' },
    ],
  },
  {
    slug:           'prohibited-items',
    title:          'Prohibited Items Policy',
    shortTitle:     'Prohibited Items',
    breadcrumbTitle: 'Prohibited Items',
    description:    'Items and services that are not allowed on the Aliwayz marketplace.',
    seoTitle:       'Prohibited Items Policy — Aliwayz',
    seoDescription: 'View the complete list of items and services that are prohibited from being listed or sold on the Aliwayz marketplace platform.',
    canonicalPath:  '/legal/prohibited-items',
    icon:           Ban,
    category:       'marketplace',
    pageCategory:   'Marketplace',
    priority:       7,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz prohibited items',
      'banned items',
      'restricted products',
      'marketplace restrictions',
      'forbidden listings',
    ],
    relatedPages: ['community-guidelines', 'seller-policy', 'report-abuse'],

    sections: [
      { id: 'overview',                   title: 'Overview' },
      { id: 'illegal-items',              title: 'Illegal Items' },
      { id: 'regulated-items',            title: 'Regulated Items' },
      { id: 'dangerous-items',            title: 'Dangerous Items' },
      { id: 'prohibited-services',        title: 'Prohibited Services' },
      { id: 'counterfeit-goods',          title: 'Counterfeit Goods' },
      { id: 'reporting-prohibited-items', title: 'Reporting Prohibited Items' },
      { id: 'consequences',               title: 'Consequences' },
      { id: 'contact-us',                 title: 'Contact Us' },
    ],
  },

  // ─── Account & Data ─────────────────────────────────────────
  {
    slug:           'account-deletion',
    title:          'Account Deletion',
    shortTitle:     'Delete Account',
    breadcrumbTitle: 'Account Deletion',
    description:    'How to delete your Aliwayz account and what happens to your data.',
    seoTitle:       'Account Deletion — Aliwayz',
    seoDescription: 'Learn how to delete your Aliwayz account, what happens to your data after deletion, and the data retention timeline.',
    canonicalPath:  '/legal/account-deletion',
    icon:           UserX,
    category:       'account',
    pageCategory:   'Account & Data',
    priority:       8,

    footerVisible:          false,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz account deletion',
      'delete account',
      'remove account',
      'close account',
      'account removal',
    ],
    relatedPages: ['data-deletion', 'privacy-policy'],

    sections: [
      { id: 'how-to-delete',     title: 'How to Delete Your Account' },
      { id: 'what-happens',      title: 'What Happens When You Delete' },
      { id: 'data-retention',    title: 'Data Retention After Deletion' },
      { id: 'before-you-delete', title: 'Before You Delete' },
      { id: 'reactivation',      title: 'Account Reactivation' },
      { id: 'contact-us',        title: 'Contact Us' },
    ],
  },
  {
    slug:           'data-deletion',
    title:          'Data Deletion Policy',
    shortTitle:     'Data Deletion',
    breadcrumbTitle: 'Data Deletion',
    description:    'How Aliwayz handles data deletion requests and your data rights.',
    seoTitle:       'Data Deletion Policy — Aliwayz',
    seoDescription: 'Understand your data deletion rights on Aliwayz, including how to request deletion, what data is removed, and the processing timeline.',
    canonicalPath:  '/legal/data-deletion',
    icon:           Database,
    category:       'account',
    pageCategory:   'Account & Data',
    priority:       9,

    footerVisible:          false,
    settingsVisible:        true,
    googlePlayRelevant:     true,
    appStoreRelevant:       true,
    requiresAuthentication: false,

    keywords: [
      'aliwayz data deletion',
      'delete my data',
      'data removal',
      'data rights',
      'right to be forgotten',
    ],
    relatedPages: ['account-deletion', 'privacy-policy'],

    sections: [
      { id: 'your-data-rights',     title: 'Your Data Rights' },
      { id: 'how-to-request',       title: 'How to Request Data Deletion' },
      { id: 'what-data-is-deleted', title: 'What Data Is Deleted' },
      { id: 'data-we-may-retain',   title: 'Data We May Retain' },
      { id: 'processing-timeline',  title: 'Processing Timeline' },
      { id: 'verification',         title: 'Verification' },
      { id: 'contact-us',           title: 'Contact Us' },
    ],
  },

  // ─── Safety & Support ───────────────────────────────────────
  {
    slug:           'safety-guidelines',
    title:          'Safety Guidelines',
    shortTitle:     'Safety',
    breadcrumbTitle: 'Safety Guidelines',
    description:    'Tips and best practices for staying safe on Aliwayz.',
    seoTitle:       'Safety Guidelines — Aliwayz',
    seoDescription: 'Stay safe on Aliwayz with our comprehensive safety guidelines covering in-person meetings, payment safety, scam prevention, and more.',
    canonicalPath:  '/legal/safety-guidelines',
    icon:           HeartHandshake,
    category:       'safety',
    pageCategory:   'Safety & Support',
    priority:       14,

    footerVisible:          true,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz safety',
      'marketplace safety',
      'safe transactions',
      'meeting safety',
      'scam prevention',
      'buyer safety',
      'seller safety',
    ],
    relatedPages: ['community-guidelines', 'report-abuse', 'buyer-policy', 'seller-policy'],

    sections: [
      { id: 'general-safety',              title: 'General Safety' },
      { id: 'meeting-in-person',            title: 'Meeting in Person' },
      { id: 'payment-safety',              title: 'Payment Safety' },
      { id: 'protecting-your-information', title: 'Protecting Your Information' },
      { id: 'recognizing-scams',            title: 'Recognizing Scams' },
      { id: 'vehicle-transactions',         title: 'Vehicle Transactions' },
      { id: 'property-transactions',        title: 'Property Transactions' },
      { id: 'reporting-concerns',           title: 'Reporting Concerns' },
      { id: 'contact-us',                  title: 'Contact Us' },
    ],
  },
  {
    slug:           'report-abuse',
    title:          'Report Abuse',
    shortTitle:     'Report Abuse',
    breadcrumbTitle: 'Report Abuse',
    description:    'How to report abuse, fraud, or inappropriate content on Aliwayz.',
    seoTitle:       'Report Abuse — Aliwayz',
    seoDescription: 'Report abuse, fraud, scams, or inappropriate content on Aliwayz. Learn what to report, how to submit a report, and what happens after.',
    canonicalPath:  '/legal/report-abuse',
    icon:           Flag,
    category:       'safety',
    pageCategory:   'Safety & Support',
    priority:       10,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz report abuse',
      'report fraud',
      'report scam',
      'report inappropriate content',
      'safety report',
    ],
    relatedPages: ['safety-guidelines', 'community-guidelines', 'prohibited-items'],

    sections: [
      { id: 'what-to-report',       title: 'What to Report' },
      { id: 'how-to-report',        title: 'How to Report' },
      { id: 'what-happens-next',    title: 'What Happens Next' },
      { id: 'false-reports',        title: 'False Reports' },
      { id: 'emergency-situations', title: 'Emergency Situations' },
      { id: 'contact-us',           title: 'Contact Us' },
    ],
  },
  {
    slug:           'contact',
    title:          'Contact Us',
    shortTitle:     'Contact',
    breadcrumbTitle: 'Contact Us',
    description:    'Get in touch with the Aliwayz team for support, privacy, or legal inquiries.',
    seoTitle:       'Contact Us — Aliwayz',
    seoDescription: 'Contact the Aliwayz team for general support, privacy inquiries, legal notices, or to report an issue with the marketplace.',
    canonicalPath:  '/legal/contact',
    icon:           Mail,
    category:       'safety',
    pageCategory:   'Safety & Support',
    priority:       15,

    footerVisible:          false,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'aliwayz contact',
      'support email',
      'customer support',
      'help',
      'get in touch',
    ],
    relatedPages: ['about', 'report-abuse'],

    sections: [
      { id: 'general-support',   title: 'General Support' },
      { id: 'privacy-inquiries', title: 'Privacy Inquiries' },
      { id: 'legal-notices',     title: 'Legal Notices' },
      { id: 'report-an-issue',   title: 'Report an Issue' },
      { id: 'response-times',    title: 'Response Times' },
    ],
  },
  {
    slug:           'about',
    title:          'About Aliwayz',
    shortTitle:     'About',
    breadcrumbTitle: 'About',
    description:    'Learn about Aliwayz, our mission, and how we connect local buyers and sellers.',
    seoTitle:       'About Aliwayz',
    seoDescription: 'Learn about Aliwayz, a marketplace platform connecting local buyers and sellers with QR-verified transactions for vehicles, real estate, and everyday products.',
    canonicalPath:  '/legal/about',
    icon:           Info,
    category:       'safety',
    pageCategory:   'Safety & Support',
    priority:       16,

    footerVisible:          true,
    settingsVisible:        false,
    googlePlayRelevant:     false,
    appStoreRelevant:       false,
    requiresAuthentication: false,

    keywords: [
      'about aliwayz',
      'aliwayz marketplace',
      'local marketplace',
      'qr verification',
      'buy and sell locally',
    ],
    relatedPages: ['contact', 'safety-guidelines'],

    sections: [
      { id: 'our-mission',       title: 'Our Mission' },
      { id: 'how-aliwayz-works', title: 'How Aliwayz Works' },
      { id: 'what-we-offer',     title: 'What We Offer' },
      { id: 'qr-verification',   title: 'QR Verified Transactions' },
      { id: 'our-commitment',    title: 'Our Commitment' },
      { id: 'contact-us',        title: 'Contact Us' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// DERIVED EXPORTS
// ═══════════════════════════════════════════════════════════════

/** Pages that should appear as links in the site footer. */
export const LEGAL_FOOTER_LINKS = LEGAL_PAGES
  .filter((p) => p.footerVisible)
  .sort((a, b) => a.priority - b.priority)
  .map((p) => ({ label: p.shortTitle, to: p.canonicalPath }));

/** Pages that should appear in user settings / profile screens. */
export const LEGAL_SETTINGS_LINKS = LEGAL_PAGES
  .filter((p) => p.settingsVisible)
  .sort((a, b) => a.priority - b.priority)
  .map((p) => ({ label: p.shortTitle, to: p.canonicalPath, slug: p.slug }));

/** Pages required for Google Play Data Safety compliance. */
export const LEGAL_GOOGLE_PLAY_REQUIRED_PAGES = LEGAL_PAGES
  .filter((p) => p.googlePlayRelevant)
  .sort((a, b) => a.priority - b.priority);

/** Pages required for Apple App Store review compliance. */
export const LEGAL_APP_STORE_REQUIRED_PAGES = LEGAL_PAGES
  .filter((p) => p.appStoreRelevant)
  .sort((a, b) => a.priority - b.priority);

/** All legal routes (none require authentication). */
export const LEGAL_PUBLIC_ROUTES = LEGAL_PAGES
  .sort((a, b) => a.priority - b.priority)
  .map((p) => ({
    path:  p.canonicalPath,
    slug:  p.slug,
    title: p.title,
  }));

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get a legal page by its slug.
 * @param {string} slug
 * @returns {object|undefined}
 */
export function getLegalPageBySlug(slug) {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}

/**
 * Get all legal pages in a specific category.
 * @param {string} categoryId
 * @returns {object[]}
 */
export function getLegalPagesByCategory(categoryId) {
  return LEGAL_PAGES
    .filter((page) => page.category === categoryId)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Build the full canonical URL for a legal page.
 * @param {string} slug
 * @returns {string}
 */
export function getLegalPageUrl(slug) {
  return `${LEGAL_BASE_URL}/${slug}`;
}

/**
 * Get related page objects for a given slug.
 * @param {string} slug
 * @returns {object[]}
 */
export function getRelatedPages(slug) {
  const page = getLegalPageBySlug(slug);
  if (!page) return [];
  return page.relatedPages
    .map((s) => getLegalPageBySlug(s))
    .filter(Boolean);
}

/**
 * Get all legal pages sorted by priority.
 * @returns {object[]}
 */
export function getAllLegalPagesSorted() {
  return [...LEGAL_PAGES].sort((a, b) => a.priority - b.priority);
}
