// ─────────────────────────────────────────
// All API endpoints — matches backend exactly
// Base: /api/v1 (set in axios instance)
// ─────────────────────────────────────────

export const API = {
  // ── Auth ──────────────────────────────────────────────────────
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    GOOGLE_OAUTH: '/auth/oauth/google',
    APPLE_OAUTH: '/auth/oauth/apple',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PHONE_VERIFY_REQUEST: '/auth/phone/verify-request',
    PHONE_VERIFY_CONFIRM: '/auth/phone/verify-confirm',
    COMPLETE_PROFILE: '/auth/complete-profile',
  },

  // ── Users ─────────────────────────────────────────────────────
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
    UPLOAD_AVATAR: '/users/me/avatar',
    UPDATE_LOCATION: '/users/me/location',
    UPDATE_ROLE: '/users/me/role',
    UPDATE_FCM_TOKEN: '/users/me/fcm-token',
    PURCHASES: '/users/me/purchases',
    FAVORITES: '/users/me/favorites',
    FOLLOWING: '/users/me/following',
    NOTIFICATIONS: '/users/me/notifications',
    READ_ALL_NOTIFICATIONS: '/users/me/notifications/read-all',
    READ_NOTIFICATION: (id) => `/users/me/notifications/${id}`,
    DELETE_ACCOUNT: '/users/me',
    PUBLIC_PROFILE: (username) => `/users/${username}`,
  },

  // ── Stores ────────────────────────────────────────────────────
  STORES: {
    CREATE: '/stores',
    MY: '/stores/my', // ← ADD THIS
    BY_SLUG: (slug) => `/stores/${slug}`,
    UPDATE: (id) => `/stores/${id}`,
    UPLOAD_LOGO: (id) => `/stores/${id}/logo`,
    UPLOAD_BANNER: (id) => `/stores/${id}/banner`,
    PRODUCTS: (slug) => `/stores/${slug}/products`,
    ANALYTICS: (id) => `/stores/${id}/analytics`,
    FOLLOW: (slug) => `/stores/${slug}/follow`,
    UNFOLLOW: (slug) => `/stores/${slug}/follow`,
    FOLLOWERS: (id) => `/stores/${id}/followers`,
    DELETE: (id) => `/stores/${id}`,
  },

  // ── Products ──────────────────────────────────────────────────
  PRODUCTS: {
    CREATE: '/products',
    BROWSE: '/products',
    TRENDING: '/products/feed/trending',
    RECENT: '/products/feed/recent',
    NEARBY: '/products/feed/nearby',
    RECOMMENDED: '/products/feed/recommended',
    BY_ID: (id) => `/products/${id}`,
    UPDATE: (id) => `/products/${id}`,
    UPDATE_STATUS: (id) => `/products/${id}/status`,
    DELETE: (id) => `/products/${id}`,
    UPLOAD_IMAGES: (id) => `/products/${id}/images`,
    DELETE_IMAGE: (id, imgId) => `/products/${id}/images/${imgId}`,
    UPLOAD_VIDEO: (id) => `/products/${id}/video`,
    FAVORITE: (id) => `/products/${id}/favorite`,
    UNFAVORITE: (id) => `/products/${id}/favorite`,
  },

  // ── Categories ────────────────────────────────────────────────
  CATEGORIES: {
    TREE: '/categories',
    FLAT: '/categories/flat',
    BY_SLUG: (slug) => `/categories/${slug}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // ── Search ────────────────────────────────────────────────────
  SEARCH: {
    PRODUCTS: '/search',
    STORES: '/search/stores',
    SUGGESTIONS: '/search/suggestions',
    POPULAR: '/search/popular',
    HISTORY: '/search/history',
    CLEAR_HISTORY: '/search/history',
  },

  // ── Conversations (Chat) ──────────────────────────────────────
  CONVERSATIONS: {
    CREATE: '/conversations',
    LIST: '/conversations',
    BY_ID: (id) => `/conversations/${id}`,
    MESSAGES: (id) => `/conversations/${id}/messages`,
    MARK_READ: (id) => `/conversations/${id}/read`,
    ARCHIVE: (id) => `/conversations/${id}`,
    BLOCK: (id) => `/conversations/${id}/block`,
    REPORT: (id) => `/conversations/${id}/report`,
  },

  // ── QR ────────────────────────────────────────────────────────
  QR: {
    GENERATE: '/qr/generate',
    SCAN: '/qr/scan',
    CANCEL: '/qr/cancel',
    REGENERATE: '/qr/regenerate',
    STATUS: (productId) => `/qr/status/${productId}`,
  },

  // ── Reviews ───────────────────────────────────────────────────
  REVIEWS: {
    CREATE: '/reviews',
    BY_USER: (userId) => `/reviews/user/${userId}`,
    USER_SUMMARY: (userId) => `/reviews/user/${userId}/summary`,
    USER_WRITTEN: (userId) => `/reviews/user/${userId}/written`,
    BY_STORE: (storeId) => `/reviews/store/${storeId}`,
  },

  // ── Favorites ─────────────────────────────────────────────────
  FAVORITES: {
    LIST: '/favorites',
    ADD: (productId) => `/favorites/${productId}`,
    REMOVE: (productId) => `/favorites/${productId}`,
    STATUS: (productId) => `/favorites/${productId}/status`,
  },

  // ── Followers ─────────────────────────────────────────────────
  FOLLOWERS: {
    FOLLOW: (storeId) => `/followers/stores/${storeId}`,
    UNFOLLOW: (storeId) => `/followers/stores/${storeId}`,
    STORE_FOLLOWERS: (storeId) => `/followers/stores/${storeId}`,
    MY_STORES: '/followers/me/stores',
    STATUS: (storeId) => `/followers/stores/${storeId}/status`,
  },

  // ── Notifications ─────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },

  // ── Reports ───────────────────────────────────────────────────
  REPORTS: {
    CREATE: '/reports',
    MY_LIST: '/reports/me',
    LIST: '/reports',
    RESOLVE: (id) => `/reports/${id}`,
  },

  // ── Badges ────────────────────────────────────────────────────
  BADGES: {
    ALL: '/badges',
    USER: (userId) => `/badges/user/${userId}`,
    PROGRESS: '/badges/me/progress',
    HISTORY: (userId) => `/badges/history/${userId}`,
    EVALUATE: (userId) => `/badges/evaluate/${userId}`,
  },

  // ── Admin ─────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: (id) => `/admin/users/${id}`,
    USER_STATUS: (id) => `/admin/users/${id}/status`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    STORES: '/admin/stores',
    VERIFY_STORE: (id) => `/admin/stores/${id}/verify`,
    PRODUCTS: '/admin/products',
    FEATURE_PRODUCT: (id) => `/admin/products/${id}/feature`,
    DELETE_PRODUCT: (id) => `/admin/products/${id}`,
    REPORTS: '/reports',
    RESOLVE_REPORT: (id) => `/reports/${id}`,
    BROADCAST: '/admin/notifications/push',
    LOGS: '/admin/logs',
  },
};
