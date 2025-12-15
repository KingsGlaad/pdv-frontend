// src/providers/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { api } from '@/services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER';
};

type AuthContextType = {
  user: User | null;
  isLogged: boolean;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => void;
  loadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isLogged = !!user;

  async function loadUser() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      destroyCookie(undefined, 'access_token', { path: '/' });
    } finally {
      setLoading(false);
    }
  }

  async function signin(email: string, password: string) {
    try {
      const { data } = await api.post('/auth/signin', {
        email,
        password,
      });

      const { token, user } = data;

      setCookie(undefined, 'access_token', token, {
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });

      api.defaults.headers.Authorization = `Bearer ${token}`;

      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  }

  function signout() {
    destroyCookie(undefined, 'access_token', { path: '/' });
    delete api.defaults.headers.Authorization;
    setUser(null);
    window.location.href = '/login';
  }

  useEffect(() => {
    const { 'access_token': token } = parseCookies();

    if (token) {
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLogged, loading, signin, signout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
