import axios from 'axios';
import toast from '@lib/toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ─────────────────────────────────────────
// Token Storage — sessionStorage for persistence
// Survives navigation but clears on tab close
// More secure than localStorage
// ─────────────────────────────────────────
const TOKEN_KEY         = 'aliwayz_at';
const REFRESH_TOKEN_KEY = 'aliwayz_rt';

let isRefreshing  = false;
let refreshQueue  = [];

export function setTokens(access, refresh) {
  if (access)  sessionStorage.setItem(TOKEN_KEY, access);
  if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ── 401 → try refresh ────────────────────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: getRefreshToken() },
          { timeout: 10000 }
        );

        const { access_token, refresh_token } = response.data.data;
        setTokens(access_token, refresh_token);
        processQueue(null, access_token);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    // ── 403 ──────────────────────────────────────────────
    if (error.response?.status === 403) {
      const code = error.response?.data?.code;
      if (code === 'ACCOUNT_BANNED') {
        window.dispatchEvent(new CustomEvent('auth:banned'));
      }
    }

    // ── 429 ──────────────────────────────────────────────
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.', {
        id: 'rate-limit',
      });
    }

    // ── Network ──────────────────────────────────────────
    if (!error.response) {
      toast.error('Network error. Check your connection.', {
        id: 'network-error',
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;