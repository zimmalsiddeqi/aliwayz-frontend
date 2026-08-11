import { Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

const HomePage = lazy(() => import('@features/home/pages/HomePage'));

export default function RoleBasedHome() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;

  // Admin always goes to admin panel
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  );
}