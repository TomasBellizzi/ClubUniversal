import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRole, getToken, getUser } from '../helpers/auth';

export function PrivateRoute({ children, allowedRoles = [], allowInitialPasswordChange = false }) {
  const { isAuthenticated, loading, user, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Verificando autorización…</div>;

  const storedUser = getUser();
  const currentRole = getRole() || storedUser?.rol || storedUser?.role || user?.rol || user?.role;
  const hasStoredAuth = Boolean(getToken() && currentRole);

  if ((!isAuthenticated || !user) && !hasStoredAuth) {
    return <Navigate to="/" replace />;
  }

  const mustChangePassword =
    storedUser?.requiereCambioPassword === true || user?.requiereCambioPassword === true;

  if (mustChangePassword && !allowInitialPasswordChange) {
    return <Navigate to="/cambiar-password-inicial" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.length) {
    return children;
  }

  const permitido =
    hasRole(allowedRoles) ||
    allowedRoles.map(String).map((role) => role.toUpperCase()).includes(String(currentRole || '').toUpperCase());
  if (permitido) return children;

  switch (currentRole) {
    case 'SOCIO':
      return <Navigate to="/inicioSocio" replace />;
    case 'ADMINISTRATIVO':
    case 'ADMIN':
      return <Navigate to="/inicio" replace />;
    default:
      return <Navigate to="/inicio" replace />;
  }
}
