/**
 * Legal System Configuration & Version Tracking
 * Used across legal center pages, auth registration, OAuth consent gates, and re-consent flows.
 */

export const CURRENT_TERMS_VERSION = '2026-10-15';
export const CURRENT_PRIVACY_VERSION = '2026-10-15';
export const POLICY_EFFECTIVE_DATE = 'October 15, 2026';

export const LEGAL_VERSIONS = {
  terms: CURRENT_TERMS_VERSION,
  privacy: CURRENT_PRIVACY_VERSION,
  effectiveDate: POLICY_EFFECTIVE_DATE,
};

export default LEGAL_VERSIONS;
