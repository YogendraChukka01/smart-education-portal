import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  GraduationCap,
  Target,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  Loader2,
  Compass,
  Code2,
  FolderGit2,
  Calendar,
  Users,
  Award,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard();
  }, [user]);

  const fetchStudentDashboard = async () => {
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        api.get('/analytics/student'),
        api.get('/mentorship/events'),
      ]);
      setData(analyticsRes.data);
      setEvents(eventsRes.data.events?.slice(0, 2) || []);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your student career dashboard...</p>
      </div>
    );
  }

  const {
    placementReadinessPct = 78,
    profileCompletionPct = 90,
    targetRoleTitle = 'AI Engineer (LLMs, RAG & Agentic AI)',
    topSkillGaps = [],
    nextBestAction = {
      title: 'Upload Two Sum or RAG Pipeline Solution Code',
      description: 'Submit your solution code file in the Coding Arena to verify DSA and AI/ML proficiency.',
      actionLink: '/student/coding',
      buttonLabel: 'Go to Coding Arena',
    },
    applicationsCount = 1,
    shortlistedCount = 1,
    interviewsCount = 0,
    offersCount = 0,
    recommendedOpportunities = [],
    activeProjectsCount = 1,
  } = data || {};

  const studentProfile = user?.studentProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {studentProfile?.name || 'Yogendra Chukka'}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              {studentProfile?.branchName || 'Computer Science & Engineering'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {studentProfile?.degree || 'B.Tech'} • Year {studentProfile?.year || 3} (Semester {studentProfile?.semester || 6}) • CGPA: {studentProfile?.cgpa || 8.64} • {user?.institution?.name || 'Audisankara University'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/profile"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-300"
          >
            Edit Academic Profile
          </Link>
          <Link
            to="/student/opportunities"
            className="px-4 py-2 btn-brand text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Browse Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Profile Completion Prompt Bar (POD.ai Practical Style) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-brand flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {profileCompletionPct}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Profile Completeness: {profileCompletionPct}% Completed
            </div>
            <p className="text-[11px] text-slate-600">
              Complete your profile with verified projects and assessments to unlock top campus recruitment matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/coding"
            className="px-3.5 py-1.5 btn-brand hover:bg-blue-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1 shrink-0"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Coding Arena</span>
          </Link>
          <Link
            to="/student/projects"
            className="px-3.5 py-1.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 text-xs font-bold rounded-xl shrink-0"
          >
            <FolderGit2 className="w-3.5 h-3.5 inline mr-1 text-indigo-700" />
            <span>Add Project</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Placement Readiness */}
        <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Placement Readiness</span>
              <Target className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">
                {placementReadinessPct > 0 ? `${placementReadinessPct}%` : 'Pending'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {placementReadinessPct > 0 ? `for ${targetRoleTitle}` : 'Complete an assessment to calculate'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${placementReadinessPct}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Verified Projects: <strong>{activeProjectsCount}</strong></span>
            <Link to="/student/career-gaps" className="text-indigo-700 font-bold hover:underline flex items-center gap-0.5">
              Skill Radar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Applications Pipeline */}
        <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>My Applications</span>
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-xl font-black text-slate-800">{applicationsCount}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Applied</div>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded-xl border border-blue-100">
                <div className="text-xl font-black text-indigo-700">{shortlistedCount}</div>
                <div className="text-[10px] text-indigo-800 font-medium mt-0.5">Shortlisted</div>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                <div className="text-xl font-black text-purple-700">{interviewsCount}</div>
                <div className="text-[10px] text-purple-800 font-medium mt-0.5">Interview</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Offers: <strong>{offersCount}</strong></span>
            <Link to="/student/applications" className="text-indigo-700 font-bold hover:underline flex items-center gap-0.5">
              View Tracker <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Next Best Action */}
        <div className="md:col-span-4 bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-blue-200 text-xs font-bold uppercase tracking-wider">
              <span>Next Best Action</span>
              <Clock className="w-4 h-4 text-blue-200" />
            </div>
            <h3 className="font-bold text-base mt-2 text-white">{nextBestAction.title}</h3>
            <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
              {nextBestAction.description}
            </p>
          </div>

          <Link
            to={nextBestAction.actionLink}
            className="w-full text-center py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <span>{nextBestAction.buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two-Column Section: Top Skill Gaps & Recommended Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Skill Gaps */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Your Top Skill Gaps</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Benchmark: <strong>{targetRoleTitle}</strong>
              </p>
            </div>
            <Link
              to="/student/career-gaps"
              className="text-xs font-bold text-indigo-700 hover:underline"
            >
              Full Analysis →
            </Link>
          </div>

          <div className="space-y-3">
            {topSkillGaps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No skill gaps calculated yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Take an assessment to compare your skills with {targetRoleTitle} benchmarks.</p>
              </div>
            ) : topSkillGaps.map((gap: any) => (
              <div
                key={gap.skillName}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-900">{gap.skillName}</div>
                  <div className="text-[11px] text-slate-500">
                    Current: <strong className="text-slate-800">{gap.studentScore}%</strong> • Target: <strong>{gap.benchmarkScore}%</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      gap.status === 'critical_gap'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {gap.status === 'critical_gap' ? 'High Deficit' : 'Needs Practice'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/student/assessment"
              className="block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              MCQ Assessment
            </Link>
            <Link
              to="/student/coding"
              className="block text-center py-2 btn-brand text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              Coding Arena →
            </Link>
          </div>
        </div>

        {/* Right Column: High-Match Opportunities for Branch */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-700" />
                <span>Recommended for Your Branch</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by deterministic skill match & CGPA eligibility
              </p>
            </div>
            <Link
              to="/student/opportunities"
              className="text-xs font-bold text-indigo-700 hover:underline"
            >
              View All Postings →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedOpportunities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <Briefcase className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No matched opportunities yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Complete your profile and skills assessment to unlock personalized roles.</p>
                <Link to="/student/opportunities" className="inline-flex mt-3 px-3 py-2 rounded-lg btn-brand text-[11px] font-bold">Browse all opportunities</Link>
              </div>
            ) : recommendedOpportunities.map((opp: any) => (
              <div
                key={opp.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{opp.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {opp.workMode || 'Hybrid'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {opp.company?.name || 'Technology Company'} • {opp.location} • {opp.stipendOrSalary}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700">{opp.matchScorePct}%</div>
                    <div className="text-[10px] text-slate-500 font-medium">Match Score</div>
                  </div>
                  <Link
                    to="/student/opportunities"
                    className="px-3.5 py-1.5 btn-brand text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    View & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Mentorship Sessions & Alumni Connect Banner */}
      {events.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-700" />
              <span>Upcoming Mentorship Masterclasses & Alumni Talks</span>
            </h2>
            <Link to="/student/events" className="text-xs font-bold text-indigo-700 hover:underline">
              Full Calendar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {ev.type?.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-1.5">{ev.title}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hosted by {ev.hostAcademician?.name} • {new Date(ev.dateTime).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-mono text-slate-600">
                    {ev.startTime} - {ev.endTime}
                  </span>
                  <Link
                    to="/student/events"
                    className="text-xs font-bold text-indigo-700 hover:underline"
                  >
                    Register Seat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
