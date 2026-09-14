import axios from 'axios';

const rawApiUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_BACKEND_URL || '';
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '').endsWith('/api')
    ? rawApiUrl.replace(/\/+$/, '')
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

export const BACKEND_ROOT_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '') : '';

export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return BACKEND_ROOT_URL ? `${BACKEND_ROOT_URL}${cleanPath}` : cleanPath;
}

export function isDemoOfflineToken(token?: string | null): boolean {
  return !!token && token.startsWith('demo-');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ayush_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || '';
    if (status === 401) {
      // Never wipe an offline demo session — dashboards render with fallback data.
      const storedToken = localStorage.getItem('ayush_token');
      if (isDemoOfflineToken(storedToken)) {
        return Promise.reject(error);
      }
      // Auth bootstrap / demo endpoints must never wipe the stored session —
      // a transient backend failure would otherwise bounce every
      // protected route back to /login.
      const isBootstrapCall = url.includes('/auth/me') || url.includes('/auth/demo-accounts');
      if (!isBootstrapCall) {
        localStorage.removeItem('ayush_token');
        localStorage.removeItem('ayush_user');
      }
    }
    return Promise.reject(error);
  }
);
