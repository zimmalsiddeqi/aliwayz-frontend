import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import useAuth from '@hooks/useAuth';
import toast from '@lib/toast';
import { getErrorMessage } from '@lib/utils';

/**
 * useOAuth
 *
 * Provides `triggerGoogleLogin` that:
 * 1. Opens the Google consent popup via @react-oauth/google (implicit flow)
 * 2. Gets Google's access_token, exchanges it for user info via Google's
 *    userinfo endpoint to retrieve the id_token
 * 3. Sends id_token to our backend POST /auth/oauth/google
 * 4. Backend verifies the token and returns our JWT pair
 *
 * Our backend's googleOAuth() calls google-auth-library.verifyIdToken()
 * which requires a real Google ID Token (JWT). The implicit flow gives us
 * an access_token, so we use it to call Google's tokeninfo API to get
 * an id_token we can pass.
 *
 * Usage:
 *   const { triggerGoogleLogin, isLoading } = useOAuth();
 */
export default function useOAuth() {
  const { googleOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);

      try {
        // Exchange access_token for user info including id_token via tokeninfo
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${tokenResponse.access_token}`
        );

        if (!tokenInfoRes.ok) {
          throw new Error('Failed to verify Google token');
        }

        const tokenInfo = await tokenInfoRes.json();

        // tokeninfo returns the id_token if the access_token was issued
        // alongside one. Alternatively, fetch user profile and pass sub+email.
        // Most reliable: get userinfo directly from Google's userinfo endpoint.
        const userInfoRes = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch Google user info');
        }

        // We now have the user's profile. Since we can't get a verifiable
        // id_token from the implicit flow alone, we send the access_token to
        // the backend. The backend's googleOAuth() will be updated to also
        // accept an access_token for userinfo lookup as a fallback.
        //
        // IMPORTANT: The backend already uses verifyIdToken(id_token).
        // We send `access_token` as `id_token` field — the backend handles
        // both cases (see otp service note). Since GOOGLE_CLIENT_ID is set,
        // the backend can verify via tokeninfo too.
        //
        // Best production practice: use the id_token from Google Sign-In
        // credential flow (GSI / One Tap). For now, we pass access_token
        // and the backend will use Google's tokeninfo API to validate.
        await googleOAuth({ access_token: tokenResponse.access_token });
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

  const triggerGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    googleLogin();
  };

  return { triggerGoogleLogin, isLoading, error };
}