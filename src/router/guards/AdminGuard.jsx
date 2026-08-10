import { Navigate } from 'react-router-dom';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

export default function AdminGuard({ children }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}