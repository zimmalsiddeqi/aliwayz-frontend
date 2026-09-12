import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Automatically reload when Vite dynamic import fails due to new deployment/build hashes
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const lastReload = window.sessionStorage.getItem('vite_preload_reload_ts');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
    window.sessionStorage.setItem('vite_preload_reload_ts', now.toString());
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);