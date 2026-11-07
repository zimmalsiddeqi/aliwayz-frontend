import { useState } from 'react';
import useAuth from '@hooks/useAuth';
import toast from '@lib/toast';
import { getErrorMessage } from '@lib/utils';

/**
 * useAppleOAuth
 *
 * Provides `triggerAppleLogin` logic for Sign in with Apple:
 * 1. Checks for Apple JS SDK and initializes with application credentials.
 * 2. Uses proper origin redirect URI matching Apple Developer portal.
 * 3. Triggers Apple popup auth flow with native Apple ID sheet on supported devices.
 * 4. Sends identity token, auth code, user info, and role to backend POST /auth/oauth/apple.
 * 5. Provides clear, informative error handling for all edge cases.
 */
export default function useAppleOAuth() {
  const { appleOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const triggerAppleLogin = async (role = 'buyer') => {
    setIsLoading(true);
    setError(null);

    try {
      const clientId =
        import.meta.env.VITE_APPLE_CLIENT_ID || 'com.aliwayz.web';
      const redirectURI =
        import.meta.env.VITE_APPLE_REDIRECT_URI ||
        `${window.location.origin}`;

      // 1. Ensure Apple SDK is loaded
      if (!window.AppleID || !window.AppleID.auth) {
        await new Promise((resolve) => {
          const existingScript = document.getElementById('apple-auth-js');
          if (existingScript) {
            existingScript.onload = resolve;
            existingScript.onerror = () => resolve();
            return;
          }
          const script = document.createElement('script');
          script.id = 'apple-auth-js';
          script.src =
            'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = () => {
            console.warn('Apple JS SDK failed to load from CDN');
            resolve();
          };
          document.head.appendChild(script);
        });
      }

      // 2. Initialize Apple SDK and trigger sign in
      if (window.AppleID && window.AppleID.auth) {
        try {
          window.AppleID.auth.init({
            clientId,
            scope: 'name email',
            redirectURI,
            usePopup: true,
          });
        } catch (initErr) {
          console.warn('AppleID.auth.init warning:', initErr);
        }

        const res = await window.AppleID.auth.signIn();

        if (res && res.authorization) {
          const { id_token, code } = res.authorization;
          const user = res.user
            ? { name: res.user.name, email: res.user.email }
            : undefined;
          let full_name;
          if (res.user?.name) {
            full_name =
              typeof res.user.name === 'string'
                ? res.user.name
                : [res.user.name.firstName, res.user.name.lastName]
                    .filter(Boolean)
                    .join(' ');
          }

          await appleOAuth({
            identity_token: id_token,
            id_token,
            code,
            email: res.user?.email,
            user,
            full_name,
            role,
          });
          setIsLoading(false);
          return;
        }
      }

      // Fallback redirect if Apple JS SDK not available
      const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectURI
      )}&response_type=code%20id_token&response_mode=form_post&scope=name%20email`;
      window.location.href = appleAuthUrl;
    } catch (err) {
      const errCode = err?.error || err?.code || '';

      // User closed popup window -> silent cancel, do not toast error
      if (
        errCode === 'popup_closed_by_user' ||
        err?.message?.includes('closed')
      ) {
        setIsLoading(false);
        return;
      }

      // Popup blocked by browser
      if (
        errCode === 'popup_blocked_by_browser' ||
        err?.message?.includes('blocked')
      ) {
        const msg =
          'Sign-in popup was blocked by your browser. Please allow popups for Aliwayz to sign in with Apple.';
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        return;
      }

      // Apple developer client_id not configured or not registered
      if (errCode === 'invalid_client' || err?.message?.includes('invalid_client')) {
        const msg =
          'Apple Sign-In is awaiting Apple Developer configuration (VITE_APPLE_CLIENT_ID). Please configure your Service ID in Apple Developer Portal or sign in with Google or Email.';
        setError(msg);
        toast.error(msg, { duration: 6000 });
        setIsLoading(false);
        return;
      }

      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg || 'Apple sign-in could not be completed');
      setIsLoading(false);
    }
  };

  return { triggerAppleLogin, isLoading, error };
}
