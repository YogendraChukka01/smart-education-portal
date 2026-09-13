import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, UserRole } from '@ayush-portal/shared';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  Wrench,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithDemoAccount(demoEmail);
      redirectUser(user.role);
    } catch (err: any) {
      setError('Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role: UserRole) => {
    if (role === ROLES.STUDENT) navigate('/student/dashboard');
    else if (role === ROLES.ACADEMICIAN) navigate('/academician/dashboard');
    else if (role === ROLES.INDUSTRY) navigate('/industry/dashboard');
    else if (role === ROLES.INSTITUTION_ADMIN) navigate('/admin/dashboard');
    else if (role === ROLES.ALUMNI) navigate('/alumni/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-700 text-white shadow-xs mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to EduBridge
          </h2>
          <p className="text-xs text-slate-500">
            Engineering Academia–Industry Skill Mapping & Placement Portal
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Instant Demo Login (1-Click)
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-1.5 py-0.5 rounded border border-blue-200">
              No password needed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('student@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
            >
              <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Student (CSE)</div>
                <div className="text-[10px] text-slate-500 truncate">Roshan • Java/DSA</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('student.mech@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all text-left"
            >
              <Wrench className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Student (Mech)</div>
                <div className="text-[10px] text-slate-500 truncate">Aman • SolidWorks</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('academician@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left"
            >
              <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Faculty</div>
                <div className="text-[10px] text-slate-500 truncate">Dr. Joshi • HOD CSE</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('industry@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left"
            >
              <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Industry Recruiter</div>
                <div className="text-[10px] text-slate-500 truncate">TCS Digital Labs</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all text-left"
            >
              <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Placement Cell</div>
                <div className="text-[10px] text-slate-500 truncate">Dean / T&P Officer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('alumni@demo.com')}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 transition-all text-left"
            >
              <GraduationCap className="w-4 h-4 text-rose-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">Alumni</div>
                <div className="text-[10px] text-slate-500 truncate">Rahul • Microsoft SDE</div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-slate-400 font-medium">Or enter credentials</span>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@demo.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In to Portal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-1">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-700 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
