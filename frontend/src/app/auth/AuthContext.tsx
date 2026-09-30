import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'DISPATCHER' | 'STOREKEEPER' | 'LOADER' | 'DRIVER';

export interface AuthUser {
  email: string;
  displayName: string;
  role: UserRole;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const STORAGE_KEY = 'waypoint.auth';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
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

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
