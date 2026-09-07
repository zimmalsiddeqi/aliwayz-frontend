import { useState } from 'react';
import useAuth from '@hooks/useAuth';
import toast from '@lib/toast';
import { getErrorMessage } from '@lib/utils';

/**
 * useAppleOAuth
 *
 * Provides `triggerAppleLogin` logic for Apple Sign-In:
 * 1. Checks for Apple JS SDK or environment credentials (VITE_APPLE_CLIENT_ID / VITE_APPLE_REDIRECT_URI).
 * 2. Triggers Apple popup or redirect auth flow.
 * 3. Sends identity token / auth code to backend POST /auth/oauth/apple.
 */
export default function useAppleOAuth() {
  const { appleOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const triggerAppleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const clientId = import.meta.env.VITE_APPLE_CLIENT_ID || 'com.aliwayzinc.aliwayz.web';
      const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI || 'https://rzwadhwnytgypgsyvowd.supabase.co/auth/v1/callback';

      // Load Apple SDK dynamically if not loaded
      if (!window.AppleID || !window.AppleID.auth) {
        await new Promise((resolve) => {
          const existingScript = document.getElementById('apple-auth-js');
          if (existingScript) {
            existingScript.onload = resolve;
            return;
          }
          const script = document.createElement('script');
          script.id = 'apple-auth-js';
          script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
          script.onload = resolve;
          script.onerror = () => resolve();
          document.head.appendChild(script);
        });
      }

      if (window.AppleID && window.AppleID.auth) {
        window.AppleID.auth.init({
          clientId,
          scope: 'name email',
          redirectURI,
          usePopup: true,
        });

        const res = await window.AppleID.auth.signIn();
        if (res && res.authorization) {
          const { id_token, code } = res.authorization;
          const user = res.user ? { name: res.user.name, email: res.user.email } : undefined;
          await appleOAuth({ id_token, code, user });
        }
        setIsLoading(false);
      } else {
        // Direct redirect fallback to Apple ID auth URL
        const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code%20id_token&response_mode=fragment&scope=name%20email`;
        window.location.href = appleAuthUrl;
      }
    } catch (err) {
      if (err?.error !== 'popup_closed_by_user') {
        const msg = getErrorMessage(err);
        setError(msg);
        toast.error(msg || 'Apple sign-in failed');
      }
      setIsLoading(false);
    }
  };

  return { triggerAppleLogin, isLoading, error };
}
