import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <div className="page page-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function RoleRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
