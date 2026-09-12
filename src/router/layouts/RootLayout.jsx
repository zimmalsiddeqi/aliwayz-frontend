import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import LoadingScreen from '@components/common/LoadingScreen';

export default function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <ScrollRestoration />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}