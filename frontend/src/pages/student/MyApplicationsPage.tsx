import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { APPLICATION_STATUS } from '@ayush-portal/shared';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case APPLICATION_STATUS.SELECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selected / Offer
          </span>
        );
      case APPLICATION_STATUS.INTERVIEW:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Clock className="w-3.5 h-3.5" /> Interview Scheduled
          </span>
        );
      case APPLICATION_STATUS.ASSESSMENT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" /> Online Assessment
          </span>
        );
      case APPLICATION_STATUS.SHORTLISTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Profile Shortlisted
          </span>
        );
      case APPLICATION_STATUS.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5" /> Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> Applied / Under Review
          </span>
        );
    }
  };

  const stages = [
    { key: APPLICATION_STATUS.APPLIED, label: 'Applied' },
    { key: APPLICATION_STATUS.SHORTLISTED, label: 'Shortlisted' },
    { key: APPLICATION_STATUS.INTERVIEW, label: 'Interview' },
    { key: APPLICATION_STATUS.SELECTED, label: 'Selected' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Application Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Your Hiring Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Monitor your application progression through screening, technical assessments, interviews, and final offers.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore verified industry openings and apply with your verified skill profile.
          </p>
          <Link
            to="/student/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-xs shadow-2xs"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {app.opportunity?.type || 'Internship'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {app.opportunity?.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.opportunity?.company?.name || 'Recruiter'}</span>
                    <span>• {app.opportunity?.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-700 font-mono">{app.matchScorePct}%</div>
                    <div className="text-[10px] text-slate-500 font-medium">Match Snapshot</div>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>
              </div>

              {/* Progress Stage Tracker */}
              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {stages.map((st, idx) => {
                    const isPassed =
                      (app.status === APPLICATION_STATUS.SELECTED && idx <= 3) ||
                      (app.status === APPLICATION_STATUS.INTERVIEW && idx <= 2) ||
                      (app.status === APPLICATION_STATUS.SHORTLISTED && idx <= 1) ||
                      (app.status === APPLICATION_STATUS.APPLIED && idx === 0);

                    const isCurrent =
                      (app.status === APPLICATION_STATUS.APPLIED && idx === 0) ||
                      (app.status === APPLICATION_STATUS.SHORTLISTED && idx === 1) ||
                      (app.status === APPLICATION_STATUS.INTERVIEW && idx === 2) ||
                      (app.status === APPLICATION_STATUS.SELECTED && idx === 3);

                    return (
                      <div key={st.key} className="space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isPassed
                              ? isCurrent
                                ? 'bg-blue-600'
                                : 'bg-emerald-500'
                              : 'bg-slate-100'
                          }`}
                        ></div>
                        <div
                          className={`text-[11px] font-bold ${
                            isCurrent
                              ? 'text-blue-700 font-extrabold'
                              : isPassed
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History Notes */}
              {app.statusHistory?.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-700">Recruiter Activity Log:</span>
                  <p className="text-slate-600">
                    {app.statusHistory[0]?.notes || 'Profile submitted for recruiter review.'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
