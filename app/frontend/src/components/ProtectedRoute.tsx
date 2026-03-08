import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function ProtectedRoute({ children }) {
  const { user, token } = useStore();
  if (!user || !token) return <Navigate to="/login" replace />;
  return children;
}
