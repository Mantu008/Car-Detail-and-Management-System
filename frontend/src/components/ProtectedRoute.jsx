import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { PageLoader } from './ui';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

/** Login / register pages: signed-in users are sent on to the app. */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader className="min-h-screen" />;
  if (isAuthenticated) return <Navigate to={location.state?.from || (isAdmin ? '/admin' : '/')} replace />;
  return children;
};

export default ProtectedRoute;
