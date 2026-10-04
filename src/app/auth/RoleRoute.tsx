import type { ReactNode } from 'react';
import { Navigate } from '@/lib/router-compat';
import { roleHomePath, useAuth, type UserRole } from './AuthContext';

export function RoleRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="wp-boot" aria-busy="true" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHomePath(user.role)} replace />;
  return <>{children}</>;
}
