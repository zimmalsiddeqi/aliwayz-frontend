import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import LoadingScreen from '@components/common/LoadingScreen';

export default function RootLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
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