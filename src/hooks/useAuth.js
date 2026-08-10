import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@store/auth.store';
import {
  setTokens,
  clearTokens,
  getRefreshToken,
} from '@api/axios.instance';
import { getSocket, disconnectSocket } from '@lib/socket';
import axiosInstance from '@api/axios.instance';
import { API } from '@api/api.endpoints';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

/**
 * Get the correct home path based on user role
 */
function getHomePathForRole(role) {
  switch (role) {
    case 'admin':  return '/admin';
    // case 'seller': return '/dashboard';
    // case 'buyer':  return '/';
    // case 'both':   return '/';
    default:       return '/';
  }
}

export default function useAuth() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isInitialized,
    setAuth,
    setUser,
    logout: clearAuth,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitialized,

    // ── Login ──────────────────────────────────────────────
    login: async (credentials, options = {}) => {
      try {
        const response = await axiosInstance.post(API.AUTH.LOGIN, credentials);
        const data     = response.data.data;

        setAuth(data.user, data.access_token, data.refresh_token);
        getSocket(data.access_token);
        queryClient.clear();

        toast.success(`Welcome back, ${data.user.username}!`);

        // ✅ Role-based redirect
        const redirectTo = options.redirectTo || getHomePathForRole(data.user.role);
        navigate(redirectTo);

        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        options.onError?.(error);
        throw error;
      }
    },

    // ── Signup ─────────────────────────────────────────────
    signup: async (signupData, options = {}) => {
      try {
        const response = await axiosInstance.post(API.AUTH.SIGNUP, signupData);
        const data     = response.data.data;

        setAuth(data.user, data.access_token, data.refresh_token);
        getSocket(data.access_token);
        queryClient.clear();

        toast.success('Account created successfully!');

        if (data.requires_email_verification) {
          navigate('/verify-email');
        } else {
          // ✅ Role-based redirect after signup
          const homePath = getHomePathForRole(data.user.role);
          navigate(homePath);
        }

        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        options.onError?.(error);
        throw error;
      }
    },

    // ── Google OAuth ───────────────────────────────────────
    googleOAuth: async (oauthData, options = {}) => {
      try {
        const response = await axiosInstance.post(API.AUTH.GOOGLE_OAUTH, oauthData);
        const data     = response.data.data;

        setAuth(data.user, data.access_token, data.refresh_token);
        getSocket(data.access_token);
        queryClient.clear();

        toast.success(`Welcome, ${data.user.username}!`);
        navigate(getHomePathForRole(data.user.role));

        return data;
      } catch (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }
    },

    // ── Logout ─────────────────────────────────────────────
    logout: async () => {
      try {
        const refreshToken = getRefreshToken();
        await axiosInstance.post(API.AUTH.LOGOUT, {
          refresh_token: refreshToken,
          logout_all:    false,
        }).catch(() => {});
      } finally {
        disconnectSocket();
        clearAuth();
        clearTokens();
        queryClient.clear();
        toast.success('Logged out successfully');
        navigate('/login');
      }
    },
  };
}