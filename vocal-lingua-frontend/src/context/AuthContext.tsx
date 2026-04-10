'use client';

/**
 * Gabsther — Auth Context
 * ───────────────────────────
 * Provides user auth state throughout the app.
 * Handles login, logout, registration, and token persistence.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, userApi, tokenStorage } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the current user from /api/users/me/ */
  const refreshUser = useCallback(async () => {
    try {
      const me = await userApi.me();
      setUser(me);
    } catch {
      setUser(null);
      tokenStorage.clear();
    }
  }, []);

  /** On mount, check if we have a stored token and load the user */
  useEffect(() => {
    const init = async () => {
      const token = tokenStorage.getAccess();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    tokenStorage.set({ access: data.access, refresh: data.refresh });
    setUser({
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      date_joined: '',
      last_login: null,
      profile: null as unknown as User['profile'],
    });
    // Load full profile
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    const response = await authApi.register(data);
    tokenStorage.set({ access: response.access, refresh: response.refresh });
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // Ignore logout errors
      }
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
