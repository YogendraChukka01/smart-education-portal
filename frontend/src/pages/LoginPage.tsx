import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, UserRole } from '@ayush-portal/shared';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  Wrench,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Gauge,
  Target,
  Radar,
  type LucideIcon,
} from 'lucide-react';

interface DemoAccount {
  email: string;
  role: string;
  tagline: string;
  icon: LucideIcon;
  iconClass: string;
  hoverClass: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'student@demo.com',
    role: 'Student (CSE-AI&ML)',
    tagline: 'Yogi • Python / ML / RAG',
    icon: GraduationCap,
    iconClass: 'bg-indigo-100 text-indigo-700',
    hoverClass: 'hover:border-indigo-200 hover:bg-indigo-50',
  },
  {
    email: 'student.mech@demo.com',
    role: 'Student (Mech)',
    tagline: 'Aman • SolidWorks',
    icon: Wrench,
    iconClass: 'bg-amber-100 text-amber-700',
    hoverClass: 'hover:border-amber-200 hover:bg-amber-50',
  },
  {
    email: 'academician@demo.com',
    role: 'Faculty / HOD',
    tagline: 'Dr. Joshi • Dept. of CSE',
    icon: Building2,
    iconClass: 'bg-sky-100 text-sky-700',
    hoverClass: 'hover:border-sky-200 hover:bg-sky-50',
  },
  {
    email: 'industry@demo.com',
    role: 'Industry Recruiter',
    tagline: 'TCS Digital Labs',
    icon: Briefcase,
    iconClass: 'bg-emerald-100 text-emerald-700',
    hoverClass: 'hover:border-emerald-200 hover:bg-emerald-50',
  },
  {
    email: 'admin@demo.com',
    role: 'Placement Cell',
    tagline: 'Dean / T&P Officer',
    icon: ShieldCheck,
    iconClass: 'bg-purple-100 text-purple-700',
    hoverClass: 'hover:border-purple-200 hover:bg-purple-50',
  },
  {
    email: 'alumni@demo.com',
    role: 'Alumni',
    tagline: 'Rahul • Microsoft SDE',
    icon: GraduationCap,
    iconClass: 'bg-rose-100 text-rose-700',
    hoverClass: 'hover:border-rose-200 hover:bg-rose-50',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Gauge, title: 'Placement Readiness Score', desc: 'Real-time readiness gauge with live skill-gap radar.' },
  { icon: Target, title: 'Smart Opportunity Matching', desc: 'Deterministic, branch-aware ranking of jobs & internships.' },
  { icon: Radar, title: 'Curriculum Gap Radar', desc: 'Industry demand vs. syllabus signals for reform.' },
  { icon: ShieldCheck, title: 'Verifiable Portfolios', desc: 'Tamper-evident digital profile every recruiter can trust.' },
];

const STATS = [
  { value: '92%', label: 'Avg. match confidence' },
  { value: '45+', label: 'Industry partners' },
  { value: '1.2K+', label: 'Students onboarded' },
];

export const LoginPage: React.FC = () => {
  const { login, loginWithDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative isolate min-h-[calc(100vh_-_4rem)] overflow-hidden bg-slate-50">
      <div className="lg:grid lg:min-h-[calc(100vh_-_4rem)] lg:grid-cols-12">
        {/* ============ LEFT BRAND PANEL (desktop only) ============ */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-[#211371] to-violet-900 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          {/* ambient orbs */}
          <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          {/* faint blueprint grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:46px_46px]" />
          {/* bottom vignette */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-indigo-950/90 to-transparent" />

          {/* brand mark */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none tracking-tight text-white">Sethu Portal</p>
                <p className="mt-1 text-[11px] font-medium text-indigo-300">Academia · Industry · Placements</p>
              </div>
            </div>
          </div>

          {/* hero copy + features */}
          <div className="relative z-10 my-14 space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-indigo-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              Smart India Hackathon 2026 · PS 26044
            </span>

            <div className="space-y-4">
              <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-white xl:text-[2.5rem] xl:leading-[1.12]">
                Where engineering talent meets{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  industry opportunity.
                </span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-indigo-200/90">
                Assess skills, close curriculum gaps, and get matched to vetted internships and jobs through one
                intelligent placement ecosystem.
              </p>
            </div>

            {/* feature grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm transition-colors hover:bg-white/[0.13]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-200">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-white">{f.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-indigo-200/75">{f.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom proof strip */}
          <div className="relative z-10">
            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.06]">
              {STATS.map((s) => (
                <div key={s.label} className="px-2 py-3 text-center">
                  <div className="text-lg font-extrabold text-white xl:text-xl">{s.value}</div>
                  <div className="text-[10px] text-indigo-200/80">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-950" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Placement-ready profile</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-200/85">
                  Yogi closed 3 skill gaps this week and got matched to TCS Digital Labs.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ============ RIGHT FORM PANEL ============ */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:col-span-7 lg:px-10 lg:py-0">
          <div className="w-full max-w-md">
            {/* mobile brand header */}
            <div className="mb-8 text-center lg:hidden">
              <div className="inline-flex items-center gap-2.5">
                <div className="btn-brand flex h-10 w-10 items-center justify-center rounded-xl shadow-brand">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Sethu <span className="brand-text">Portal</span>
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Engineering Academia–Industry Skill Mapping & Placement</p>
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-indigo-950/5 sm:p-8">
              {/* heading */}
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back 👋</h2>
                <p className="text-xs text-slate-500">Sign in to continue to your placement dashboard.</p>
              </div>

              {/* demo access */}
              <div className="space-y-3 rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-violet-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Quick demo login
                  </span>
                  <span className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-indigo-600">
                    no password
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleDemoClick(acc.email)}
                      disabled={loading}
                      aria-label={`Demo login as ${acc.role}`}
                      className={`flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 p-2.5 text-left transition-all disabled:cursor-wait disabled:opacity-60 ${acc.hoverClass}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${acc.iconClass}`}>
                        <acc.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-slate-900">{acc.role}</span>
                        <span className="block truncate text-[9.5px] text-slate-500">{acc.tagline}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* credential form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-xs font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-brand transition-all disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Portal <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-indigo-700 transition-colors hover:text-indigo-900 hover:underline">
                  Create one here
                </Link>
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-indigo-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
