import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Building2,
  Users,
  Radar,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const InstitutionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutionAnalytics();
  }, []);

  const fetchInstitutionAnalytics = async () => {
    try {
      const res = await api.get('/analytics/institution');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load institution analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading placement & curriculum analytics...</p>
      </div>
    );
  }

  const {
    totalStudents = 2450,
    studentsAssessedCount = 1840,
    assessmentCompletionPct = 84,
    placementRatePct = 78,
    internshipParticipationRatePct = 82,
    departmentReadiness = [],
    skillGapSeverityDistribution = [],
    curriculumGapRadar = [],
  } = data || {};

  const criticalGapsCount = curriculumGapRadar.filter((i: any) => i.gapStatus === 'Critical Priority').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Institution Placement & Curriculum Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.institution?.name || 'Audisankara University'} Placement Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time multi-branch skill gap monitoring, syllabus alignment signals, and student placement analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/curriculum-gap"
            className="px-4 py-2 btn-brand text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Radar className="w-4 h-4" />
            <span>Curriculum Gap Radar</span>
          </Link>
          <Link
            to="/admin/roster"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Student & Faculty Roster</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
          <div className="text-3xl font-black text-slate-900 mt-1">2,450</div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 engineering depts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Rate</span>
          <div className="text-3xl font-black text-indigo-700 mt-1">{assessmentCompletionPct}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified skill benchmarks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Readiness</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{placementRatePct}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for campus interviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Internship Rate</span>
          <div className="text-3xl font-black text-purple-700 mt-1">{internshipParticipationRatePct}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Industry exposure</p>
        </div>
      </div>

      {/* Department Readiness Comparison Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Branch-Wise Placement Readiness Comparison</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Average aggregate readiness score across all 6 engineering departments.
            </p>
          </div>
          <Link
            to="/admin/curriculum-gap"
            className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
          >
            <span>View Department Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentReadiness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="readinessPct" name="Placement Readiness %" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Curriculum Gap Signal Spotlight Box */}
      <div className="bg-amber-50/80 p-6 rounded-2xl border border-amber-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Curriculum Signal Alert
            </span>
          </div>
          <h3 className="text-lg font-bold text-amber-950">
            {criticalGapsCount} Priority Deficits Detected in Active Syllabus
          </h3>
          <p className="text-xs text-amber-800 max-w-2xl leading-relaxed">
            Real-time synthesis indicates high divergence in Spring Boot Microservices, Docker Containers, and Embedded ARM Firmware where industry hiring demand exceeds student assessment averages.
          </p>
        </div>

        <Link
          to="/admin/curriculum-gap"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs whitespace-nowrap"
        >
          Open Curriculum Gap Radar
        </Link>
      </div>
    </div>
  );
};
