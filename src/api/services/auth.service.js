import api from '@api/axios.instance';
import { API } from '@api/api.endpoints';

const AuthService = {
  signup: (data) =>
    api.post(API.AUTH.SIGNUP, data).then((r) => r.data),

  login: (data) =>
    api.post(API.AUTH.LOGIN, data).then((r) => r.data),

  googleOAuth: (data) =>
    api.post(API.AUTH.GOOGLE_OAUTH, data).then((r) => r.data),

  appleOAuth: (data) =>
    api.post(API.AUTH.APPLE_OAUTH, data).then((r) => r.data),

  logout: (data) =>
    api.post(API.AUTH.LOGOUT, data).then((r) => r.data),

  refreshToken: (data) =>
    api.post(API.AUTH.REFRESH, data).then((r) => r.data),

  verifyEmail: (data) =>
    api.post(API.AUTH.VERIFY_EMAIL, data).then((r) => r.data),

  resendVerification: (data) =>
    api.post(API.AUTH.RESEND_VERIFICATION, data).then((r) => r.data),

  forgotPassword: (data) =>
    api.post(API.AUTH.FORGOT_PASSWORD, data).then((r) => r.data),

  resetPassword: (data) =>
    api.post(API.AUTH.RESET_PASSWORD, data).then((r) => r.data),

  requestPhoneVerification: (data) =>
    api.post(API.AUTH.PHONE_VERIFY_REQUEST, data).then((r) => r.data),

  confirmPhoneVerification: (data) =>
    api.post(API.AUTH.PHONE_VERIFY_CONFIRM, data).then((r) => r.data),

  completeProfile: (data) =>
    api.post(API.AUTH.COMPLETE_PROFILE, data).then((r) => r.data),
};

export default AuthService;