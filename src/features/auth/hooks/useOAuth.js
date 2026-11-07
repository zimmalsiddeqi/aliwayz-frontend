import { useGoogleLogin } from '@react-oauth/google';
import { useState, useRef } from 'react';
import useAuth from '@hooks/useAuth';
import toast from '@lib/toast';
import { getErrorMessage } from '@lib/utils';

/**
 * useOAuth
 *
 * Provides `triggerGoogleLogin` for Google Sign-In and Sign-Up.
 */
export default function useOAuth() {
  const { googleOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRole = useRef('buyer');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);

      try {
        await googleOAuth({
          access_token: tokenResponse.access_token,
          role: pendingRole.current || 'buyer',
        });
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },

    onError: (err) => {
      if (err?.error !== 'access_denied') {
        toast.error('Google sign-in failed. Please try again.');
        setError(err?.error_description || 'Google sign-in failed');
      }
      setIsLoading(false);
    },

    flow: 'implicit',
  });

  const triggerGoogleLogin = (options = {}) => {
    pendingRole.current =
      typeof options === 'string' ? options : options?.role || 'buyer';
    setIsLoading(true);
    setError(null);
    googleLogin();
  };

  return { triggerGoogleLogin, isLoading, error };
}
