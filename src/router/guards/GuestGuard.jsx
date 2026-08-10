import { Navigate } from 'react-router-dom';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

export default function GuestGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Wait for AuthInitializer in App.jsx to complete
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Already logged in → redirect home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Not logged in → show login/register page
  return children;
}