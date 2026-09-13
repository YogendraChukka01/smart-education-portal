import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, UserRole, ROLES } from '@ayush-portal/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  loginWithDemoAccount: (email: string) => Promise<User>;
  refreshUserProfile: () => Promise<void>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  [ROLES.STUDENT]: { email: 'student@demo.com', password: 'password123' },
  [ROLES.ACADEMICIAN]: { email: 'academician@demo.com', password: 'password123' },
  [ROLES.INDUSTRY]: { email: 'industry@demo.com', password: 'password123' },
  [ROLES.INSTITUTION_ADMIN]: { email: 'admin@demo.com', password: 'password123' },
  [ROLES.ALUMNI]: { email: 'alumni@demo.com', password: 'password123' },
  [ROLES.ALUMNI_ADMIN]: { email: 'alumni_admin@demo.com', password: 'password123' },
  [ROLES.ADMIN]: { email: 'admin@demo.com', password: 'password123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ayush_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.warn('Session expired, logging out');
      logout();
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ayush_token');
      if (storedToken) {
        await fetchCurrentUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'password123'): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('ayush_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemoAccount = async (email: string): Promise<User> => {
    return await login(email, 'password123');
  };

  const refreshUserProfile = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  const register = async (payload: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', payload);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('ayush_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ayush_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole): Promise<User> => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) throw new Error(`Unknown role: ${role}`);
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithDemoAccount,
        refreshUserProfile,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
