// src/config/site.js
// Centralized configuration for website constants and legal disclosures.
// Changing values here updates all legal documents and metadata site-wide.

export const SITE_NAME      = 'Aliwayz';
export const SITE_URL       = 'https://aliwayz-frontend.vercel.app';
export const DEVELOPER_NAME = 'Shawkat Ali';
export const LAST_UPDATED    = 'October 15, 2026';
export const LAST_UPDATED_ISO = '2026-10-15';
export const MIN_AGE        = 18;

export const SUPPORT_EMAIL  = 'support@aliwayz.com';
export const PRIVACY_EMAIL  = 'privacy@aliwayz.com';
export const LEGAL_EMAIL    = 'legal@aliwayz.com';

export const SUPPORT_EMAILS = {
  general: SUPPORT_EMAIL,
  privacy: PRIVACY_EMAIL,
  legal:   LEGAL_EMAIL,
};
