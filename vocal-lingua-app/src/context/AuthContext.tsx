import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage, userApi } from '@/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string; password: string; password_confirm: string;
    first_name?: string; last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await tokenStorage.getAccess();
      if (!token) return;
      const me = await userApi.me();
      setUser(me);
    } catch {
      await tokenStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await tokenStorage.set({ access: res.access, refresh: res.refresh });
    const me = await userApi.me();
    setUser(me);
  };

  const register = async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data);
    await tokenStorage.set({ access: res.access, refresh: res.refresh });
    const me = await userApi.me();
    setUser(me);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const me = await userApi.me();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
