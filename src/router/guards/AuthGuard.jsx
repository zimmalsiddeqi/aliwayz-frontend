import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  // Wait for AuthInitializer in App.jsx to complete
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}