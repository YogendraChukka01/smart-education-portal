import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Loader2,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const IndustryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndustryAnalytics();
  }, []);

  const fetchIndustryAnalytics = async () => {
    try {
      const res = await api.get('/analytics/industry');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load industry analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  const {
    activePostingsCount = 0,
    totalApplicantsCount = 0,
    shortlistedCount = 0,
    interviewedCount = 0,
    offersMadeCount = 0,
    pipelineFunnel = [],
    applicantSkillDistribution = [],
    recentPostings = [],
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Campus Talent Acquisition Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.company?.name || 'Tata Consultancy Services'} Talent Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define required skill benchmarks, target engineering branches, and rank candidates by verified compatibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/industry/post"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Opportunity</span>
          </Link>
          <Link
            to="/industry/applicants"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Candidate Ranker</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Postings</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{activePostingsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across CSE, Mech, ENTC</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</span>
          <div className="text-3xl font-black text-blue-700 mt-1">{totalApplicantsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified engineering profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Rounds</span>
          <div className="text-3xl font-black text-purple-700 mt-1">{interviewedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Technical discussions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected / Offers</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{offersMadeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Final selections made</p>
        </div>
      </div>

      {/* Visual Analytics: Funnel & Skill Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recruitment Pipeline Funnel */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recruitment Pipeline Funnel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate progression from application to selection.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {pipelineFunnel.map((stage: any) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{stage.stage}</span>
                  <span>{stage.count} Candidates ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, stage.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicant Skill Distribution Chart */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Applicant Pool Proficiency vs Threshold</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Average candidate score against required hiring threshold.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicantSkillDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="skillName" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="applicantAverage" name="Applicant Avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="requiredThreshold" name="Threshold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Postings Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Active Opportunity Postings</h2>
            <p className="text-xs text-slate-500">Live listings on the campus placement board.</p>
          </div>
          <Link
            to="/industry/post"
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Create New +
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Opportunity Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Eligible Branches</th>
                <th className="py-3 px-4 text-center">Applicants</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentPostings.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.location} ({p.workMode || 'Hybrid'})</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.eligibleBranches?.length > 0 ? p.eligibleBranches.join(', ') : 'All Branches'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700">
                    {p.applicantsCount} Candidates
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/industry/applicants?oppId=${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      <span>Rank Candidates</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
