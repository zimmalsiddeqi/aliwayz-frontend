import { lazy, Suspense } from 'react';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

const HomePage = lazy(() => import('@features/home/pages/HomePage'));

export default function RoleBasedHome() {
  const { isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  );
}