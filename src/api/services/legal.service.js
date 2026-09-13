import axiosInstance from '../axios.instance';
import { API } from '../api.endpoints';
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '../../config/legal.config';

const LegalService = {
  /**
   * Record user acceptance of Terms of Use and Privacy Policy.
   * @param {Object} payload
   * @param {string} [payload.terms_version]
   * @param {string} [payload.privacy_version]
   * @param {string} [payload.source]
   */
  async recordConsent(payload = {}) {
    const response = await axiosInstance.post(API.AUTH.LEGAL_CONSENT, {
      terms_version: payload.terms_version || CURRENT_TERMS_VERSION,
      privacy_version: payload.privacy_version || CURRENT_PRIVACY_VERSION,
      source: payload.source || 'consent_prompt',
    });
    return response.data?.data;
  },

  /**
   * Get current legal consent status for authenticated user.
   */
  async getConsentStatus() {
    const response = await axiosInstance.get(API.AUTH.LEGAL_CONSENT);
    return response.data?.data;
  },
};

export default LegalService;
