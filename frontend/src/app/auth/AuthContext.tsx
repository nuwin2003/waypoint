import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  email: string;
  displayName: string;
  role: UserRole;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}

const STORAGE_KEY = 'waypoint.auth';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' && value !== null &&
      'email' in value && typeof value.email === 'string' &&
      'displayName' in value && typeof value.displayName === 'string' &&
      'accessToken' in value && typeof value.accessToken === 'string' && value.accessToken.length > 0 &&
      'role' in value && isUserRole(value.role)
    ) {
      return value as AuthUser;
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('waypoint.token');
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadFromStorage);

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('waypoint.token', user.accessToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('waypoint.token');
    }
  }, [user]);

  const setUser = (u: AuthUser | null) => setUserState(u);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
