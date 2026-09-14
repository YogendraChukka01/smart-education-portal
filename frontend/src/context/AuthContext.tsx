import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, isDemoOfflineToken } from '../lib/api';
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

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('ayush_user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function persistSession(newToken: string, newUser: User) {
  localStorage.setItem('ayush_token', newToken);
  localStorage.setItem('ayush_user', JSON.stringify(newUser));
}

// Offline demo users — used when backend is unreachable or demo seed rows
// are missing (e.g. production DB was never seeded). This guarantees the
// Explore/Recruiter/Placement buttons land on dashboards, not /login.
function buildOfflineDemoUser(email: string): User | null {
  const normalized = email.toLowerCase().trim();
  const now = new Date().toISOString();
  if (normalized === 'student@demo.com' || normalized === 'student.mech@demo.com') {
    const isMech = normalized.includes('mech');
    return {
      id: isMech ? 'demo-student-mech' : 'demo-student-cse',
      email: normalized,
      role: ROLES.STUDENT,
      institutionId: 'demo-institution',
      createdAt: now,
      studentProfile: {
        id: 'demo-student-profile',
        name: isMech ? 'Aman Verma' : 'Roshan Shinde',
        degree: 'B.Tech',
        departmentName: isMech ? 'Mechanical Engineering' : 'Computer Science & Engineering',
        branchName: isMech ? 'Mechanical Engineering' : 'Computer Science & Engineering',
        year: 3, semester: 6, cgpa: 8.2, graduationYear: 2026,
        portfolioSlug: 'demo-portfolio',
        careerGoal: isMech ? 'CAD Design Engineer' : 'Java Backend Developer',
      },
    } as unknown as User;
  }
  if (normalized === 'academician@demo.com') {
    return {
      id: 'demo-faculty', email: normalized, role: ROLES.ACADEMICIAN,
      institutionId: 'demo-institution', createdAt: now,
      academicianProfile: {
        id: 'demo-faculty-profile', name: 'Dr. Anjali Joshi',
        department: 'Computer Science & Engineering',
        designation: 'Professor & Head of Department',
        expertiseTags: ['Distributed Systems', 'Cloud Architecture'],
      },
    } as unknown as User;
  }
  if (normalized === 'industry@demo.com') {
    return {
      id: 'demo-industry', email: normalized, role: ROLES.INDUSTRY,
      companyId: 'demo-company', createdAt: now,
      company: { id: 'demo-company', name: 'TCS Digital Labs' },
    } as unknown as User;
  }
  if (normalized === 'admin@demo.com') {
    return {
      id: 'demo-admin', email: normalized, role: ROLES.INSTITUTION_ADMIN,
      institutionId: 'demo-institution', createdAt: now,
      institution: { id: 'demo-institution', name: 'Audisankara University' },
    } as unknown as User;
  }
  if (normalized === 'alumni@demo.com') {
    return {
      id: 'demo-alumni', email: normalized, role: ROLES.ALUMNI,
      institutionId: 'demo-institution', createdAt: now,
      alumniProfile: {
        id: 'demo-alumni-profile', name: 'Rahul Patil',
        graduationYear: 2024, company: 'Microsoft', role: 'Software Engineer',
        experienceYears: 2, skills: ['Java', 'System Design'],
        isAvailableForMentorship: true,
      },
    } as unknown as User;
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ayush_token'));
  // Don't block first paint on a backend round-trip. A stuck /auth/me call
  // (backend asleep/down) used to resolve into ProtectedRoute -> /login.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authRequestId = useRef(0);

  const fetchCurrentUser = async () => {
    const storedToken = localStorage.getItem('ayush_token');
    if (!storedToken) return;
    if (isDemoOfflineToken(storedToken)) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('ayush_user', JSON.stringify(res.data.user));
    } catch (err: any) {
      if (err?.response?.status === 401) {
        console.warn('Session expired, logging out');
        logout();
      } else {
        console.warn('Profile refresh failed (backend unreachable), keeping session');
      }
    }
  };

  // Initialize auth state — guarded so a concurrent demo login can't be
  // wiped out by a stale init request (the original "goes to login" bug).
  // Runs in the background with a timeout: a sleeping backend must never
  // block routing or clear the session.
  useEffect(() => {
    const myRequest = ++authRequestId.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ayush_token');
      if (!storedToken) {
        if (authRequestId.current === myRequest) setIsLoading(false);
        return;
      }
      if (isDemoOfflineToken(storedToken)) {
        const storedUser = readStoredUser();
        if (storedUser && authRequestId.current === myRequest) {
          setUser(storedUser);
          setToken(storedToken);
        }
        if (authRequestId.current === myRequest) setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me', { signal: controller.signal } as any);
        clearTimeout(timeout);
        if (authRequestId.current === myRequest) {
          setUser(res.data.user);
          localStorage.setItem('ayush_user', JSON.stringify(res.data.user));
        }
      } catch (err: any) {
        clearTimeout(timeout);
        // Aborted / network / 5xx (backend asleep or down): keep session.
        // Only wipe the session on a definitive 401 (bad/expired token).
        const status = err?.response?.status;
        if (status === 401 && authRequestId.current === myRequest) {
          localStorage.removeItem('ayush_token');
          localStorage.removeItem('ayush_user');
          setToken(null);
          setUser(null);
        } else {
          // Keep the stored user so ProtectedRoute doesn't redirect.
          const storedUser = readStoredUser();
          if (storedUser && authRequestId.current === myRequest && !user) {
            setUser(storedUser);
          }
        }
      } finally {
        if (authRequestId.current === myRequest) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password = 'password123'): Promise<User> => {
    const myRequest = ++authRequestId.current;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      persistSession(newToken, newUser);
      if (authRequestId.current === myRequest) {
        setToken(newToken);
        setUser(newUser);
      }
      return newUser;
    } catch (err: any) {
      const offlineUser = buildOfflineDemoUser(email);
      if (offlineUser) {
        const offlineToken = `demo-${offlineUser.role}-${Date.now()}`;
        persistSession(offlineToken, offlineUser);
        if (authRequestId.current === myRequest) {
          setToken(offlineToken);
          setUser(offlineUser);
        }
        console.warn('Backend login failed, using offline demo session for', email);
        return offlineUser;
      }
      throw err;
    } finally {
      if (authRequestId.current === myRequest) setIsLoading(false);
    }
  };

  const loginWithDemoAccount = async (email: string): Promise<User> => {
    return await login(email, 'password123');
  };

  const refreshUserProfile = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  const register = async (payload: any): Promise<User> => {
    const myRequest = ++authRequestId.current;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', payload);
      const { token: newToken, user: newUser } = res.data;

      persistSession(newToken, newUser);
      if (authRequestId.current === myRequest) {
        setToken(newToken);
        setUser(newUser);
      }
      return newUser;
    } finally {
      if (authRequestId.current === myRequest) setIsLoading(false);
    }
  };

  const logout = () => {
    authRequestId.current++;
    localStorage.removeItem('ayush_token');
    localStorage.removeItem('ayush_user');
    setToken(null);
    setUser(null);
    setIsLoading(false);
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
