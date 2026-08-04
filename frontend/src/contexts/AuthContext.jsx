import { useEffect, useMemo, useState } from 'react';
import { getToken, getUser, parseJWT, isTokenExpired, clearAuth } from '../helpers/auth';
import { AuthContext } from './AuthContextBase';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (rol) => {
    if (!rol) return null;
    const r = rol.toString().toUpperCase();
    if (['ADMIN', 'ADMINISTRATIVO', 'SOCIO'].includes(r)) return r;
    return null;
  };

  useEffect(() => {
    const token = getToken();

    if (token && !isTokenExpired()) {
      const payload = parseJWT(token) || {};
      const rol = normalizeRole(payload.role || payload.rol || payload.userRole);
      setUser({ ...payload, rol });
      setLoading(false);
      return;
    } else if (token) {
      clearAuth();
    }

    const usuario = getUser();
    if (usuario) {
      const rol = normalizeRole(usuario.role || usuario.rol || (usuario.isAdmin ? 'ADMIN' : 'SOCIO'));
      setUser({ ...usuario, rol });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const isAuthenticated = !!user;
  const role = user?.rol || null;

  const value = useMemo(() => {
    const hasRole = (roles) => {
      if (!role) return false;
      if (Array.isArray(roles)) {
        return roles.map(String).map((r) => r.toUpperCase()).includes(role.toUpperCase());
      }
      return role.toUpperCase() === String(roles || '').toUpperCase();
    };

    const logout = () => {
      clearAuth();
      setUser(null);
    };

    return {
      user,
      role,
      loading,
      isAuthenticated,
      hasRole,
      logout,
    };
  }, [user, role, loading, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
