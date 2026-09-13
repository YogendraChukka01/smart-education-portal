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

export const api = axios.create({
  baseURL: API_BASE_URL,
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
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth or demo endpoints
      if (!error.config.url.includes('/auth/me') && !error.config.url.includes('/auth/demo-accounts')) {
        localStorage.removeItem('ayush_token');
        localStorage.removeItem('ayush_user');
      }
    }
    return Promise.reject(error);
  }
);
