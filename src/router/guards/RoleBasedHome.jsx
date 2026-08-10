import { Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

const HomePage = lazy(() => import('@features/home/pages/HomePage'));

export default function RoleBasedHome() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;

  // Admin → admin panel
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // ALL other roles (guest, buyer, seller, both) → same HomePage
  // HomePage handles role-specific UI internally
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  );
}