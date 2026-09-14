import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, UserRole } from '@ayush-portal/shared';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading session and profile data...</p>
      </div>
    );
  }

  // DEMO MODE: protected demo dashboards are viewable without a backend
  // session. If there is no authenticated session at all, allow direct
  // access to the demo dashboards matching the requested path so the
  // "Explore Student Flow / Recruiter / Placement Cell" buttons never land
  // on /login (e.g. backend unreachable or production DB not seeded).
  // Child dashboards already render with fallback data when user is null.
  // NOTE: this fallback intentionally ignores any STALE token in
  // localStorage — a token issued by a previous backend deploy (different
  // JWT_SECRET / wiped DB) must not trap the demo on /login.
  const isDemoDashboardPath = (): boolean => {
    const path = window.location.pathname;
    if (!allowedRoles || allowedRoles.length === 0) return false;
    if (path.startsWith('/student')) return allowedRoles.includes(ROLES.STUDENT);
    if (path.startsWith('/industry')) return allowedRoles.includes(ROLES.INDUSTRY);
    if (path.startsWith('/academician')) return allowedRoles.includes(ROLES.ACADEMICIAN);
    if (path.startsWith('/admin')) return allowedRoles.includes(ROLES.INSTITUTION_ADMIN);
    if (path.startsWith('/alumni')) return allowedRoles.includes(ROLES.ALUMNI);
    return false;
  };

  if (!user && isDemoDashboardPath()) {
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const defaultRoute = `/${user.role === 'institution_admin' ? 'admin' : user.role}/dashboard`;
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
