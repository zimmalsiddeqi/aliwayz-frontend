import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import LoadingScreen from '@components/common/LoadingScreen';
import LegalConsentModal from '@features/legal/components/LegalConsentModal';
import { cn } from '@lib/utils';

export default function RootLayout() {
  const { pathname } = useLocation();
  const isChatRoute = pathname.startsWith('/inbox');

  useEffect(() => {
    if (!isChatRoute) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, isChatRoute]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <ScrollRestoration />
      <Navbar />
      <main className={cn('flex-1 pb-16 md:pb-0', isChatRoute && 'pb-0 overflow-hidden flex flex-col')}>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
      {!isChatRoute && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      <LegalConsentModal />
    </div>
  );
}
