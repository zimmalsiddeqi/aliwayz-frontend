import { Navigate } from 'react-router-dom';
import useAuthStore from '@store/auth.store';
import LoadingScreen from '@components/common/LoadingScreen';

export default function SellerGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}