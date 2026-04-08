import React, { createContext, useContext, useMemo, useState } from 'react';
import { logoutUser } from '../api/authApi';
import {
  type AuthSession,
  type AuthUser,
  type UserRole,
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from './storage';

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getStoredSession());

  const setSession = (nextSession: AuthSession) => {
    setStoredSession(nextSession);
    setSessionState(nextSession);
  };

  const updateUser = (user: AuthUser) => {
    setSessionState((current) => {
      if (!current) {
        return current;
      }

      const nextSession = {
        ...current,
        user,
      };

      setStoredSession(nextSession);
      return nextSession;
    });
  };

  const logout = async () => {
    try {
      if (session?.token) {
        await logoutUser();
      }
    } catch {
      // Clearing local session is still correct if the backend token is already invalid.
    } finally {
      clearStoredSession();
      setSessionState(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.role ?? null,
      isAuthenticated: Boolean(session?.token),
      setSession,
      updateUser,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
