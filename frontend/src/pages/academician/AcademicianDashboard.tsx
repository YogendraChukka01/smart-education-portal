import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AcademicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicianAnalytics();
  }, []);

  const fetchAcademicianAnalytics = async () => {
    try {
      const res = await api.get('/analytics/academician');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load academician analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading faculty dashboard...</p>
      </div>
    );
  }

  const {
    activeMentorshipsCount = 0,
    totalMenteesCount = 0,
    collaborativeProjectsCount = 4,
    supervisedStudents = [],
    appliedOpportunities = [],
    upcomingEvents = [],
  } = data || {};

  const profile = user?.academicianProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Faculty Mentorship & Research Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {profile?.name || 'Dr. Anjali Joshi'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {profile?.designation || 'Professor & Head of Department'} • {profile?.department} • {user?.institution?.name || 'Audisankara University'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/academician/mentorship"
            className="px-4 py-2 btn-brand text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Host Workshop / Session</span>
          </Link>
          <Link
            to="/academician/opportunities"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>FDPs & Grants</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Mentorships</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{activeMentorshipsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Masterclasses & workshops</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Mentees</span>
          <div className="text-3xl font-black text-indigo-700 mt-1">{totalMenteesCount || 120}</div>
          <p className="text-[11px] text-slate-400 mt-1">Attended sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Industry Grants</span>
          <div className="text-3xl font-black text-purple-700 mt-1">{collaborativeProjectsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Joint research projects</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Readiness</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">81%</div>
          <p className="text-[11px] text-slate-400 mt-1">Average cohort score</p>
        </div>
      </div>

      {/* Supervised Students Readiness Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Supervised Students • Skill Readiness Cohort</h2>
            <p className="text-xs text-slate-500">Monitor student progress and top skill deficits in your department.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Branch & Year</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Placement Readiness</th>
                <th className="py-3 px-4">Strongest Skill</th>
                <th className="py-3 px-4">Top Deficit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {supervisedStudents.map((st: any) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{st.branchName || 'CSE'} (Year {st.year})</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">{st.cgpa || 8.6}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-800">{st.readinessScore}%</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                      {st.topSkill}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                      {st.gapSkill}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
