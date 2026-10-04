import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'STOREKEEPER' | 'LOADER' | 'DRIVER';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'ADMIN' || value === 'DISPATCHER' || value === 'STOREKEEPER' || value === 'LOADER' || value === 'DRIVER';
}

export function roleHomePath(role: UserRole): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'STOREKEEPER': return '/store';
    case 'LOADER': return '/load';
    case 'DRIVER': return '/drive';
    case 'DISPATCHER': return '/dispatch';
  }
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  outletId: string | null;
  depotId: string | null;
  vehicleId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true until the stored session has been checked */
  loading: boolean;
  /** signed in but account has no role or is deactivated */
  noAccess: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_PRIORITY: UserRole[] = ['ADMIN', 'DISPATCHER', 'LOADER', 'STOREKEEPER', 'DRIVER'];

export async function loadAuthUser(): Promise<{ user: AuthUser | null; signedIn: boolean }> {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser) return { user: null, signedIn: false };
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', authUser.id),
  ]);
  const role = ROLE_PRIORITY.find((r) => roles?.some((x) => x.role === r));
  if (!profile || !profile.active || !role) return { user: null, signedIn: true };
  return {
    signedIn: true,
    user: {
      id: authUser.id,
      email: profile.email,
      displayName: profile.display_name || profile.email.split('@')[0] || 'Waypoint User',
      role,
      outletId: profile.outlet_id,
      depotId: profile.depot_id,
      vehicleId: profile.vehicle_id,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  const refresh = async () => {
    const res = await loadAuthUser();
    setUser(res.user);
    setNoAccess(res.signedIn && !res.user);
    setLoading(false);
    return res.user;
  };

  useEffect(() => {
    void refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setTimeout(() => void refresh(), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNoAccess(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, noAccess, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
