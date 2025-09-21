'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'manager' | 'user';
export type SessionUser = { id: number; name: string; email: string; role: Role };

type AuthContextType = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (user: SessionUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('session_user');
      if (raw) {
        const parsed = JSON.parse(raw) as SessionUser;
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem('session_user');
        }
      }
    } catch {
      localStorage.removeItem('session_user');
    } finally {
      setReady(true);
    }
  }, []);

  const login = (u: SessionUser) => {
    setUser(u);
    localStorage.setItem('session_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session_user');
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, ready, login, logout }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Útil si quieres exponer un hook corto para guards simples:
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  return { isAuthenticated };
};
